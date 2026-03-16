'use strict';

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../MinIO/MinIOClient', () => ({
    getMinIOClient: jest.fn(),
    minioClient: { removeObject: jest.fn() }
}));
jest.mock('../logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

const axios = require('axios');
const jwt = require('jsonwebtoken');
const minioClientModule = require('../MinIO/MinIOClient');

// Set env vars before requiring the module under test
process.env.JWT_SECRET = 'test-secret';
process.env.NGINX_API = 'http://nginx';
process.env.PORT_MINIO = '9000';
process.env.MINIO_USER = 'testuser';
process.env.MINIO_USER_ACCESS_KEY = 'testkey';

const upload = require('../MinIO/upload');

// Creates a mock MinIO client that simulates a successful upload
const makeMinioMock = () => ({
    bucketExists: jest.fn().mockResolvedValue(true),
    makeBucket: jest.fn().mockResolvedValue(undefined),
    putObject: jest.fn((bucket, file, stream, size, cb) => cb(null, { etag: 'etag-abc123' }))
});

// Builds the request body that the upload route expects (as parsed by @fastify/multipart).
// The body is injected as JSON, so `data` must survive JSON serialisation with a truthy
// `.length`. A plain string is the safest choice:
//   - Buffer → serialises to {type:'Buffer',data:[...]} with no .length → fails size guard
//   - Array  → has .length but is not a valid Node.js stream chunk → stream.end() throws
//   - String → has .length AND is accepted by PassThrough.end() ✓
const makeFileBody = (filename = 'document.pdf') => ({
    file: [{
        filename,
        data: 'filebytes',
        mimetype: 'application/pdf'
    }]
});

// Shorthand to inject a POST /upload request
const injectUpload = (fastify, body, token = 'valid-token') =>
    fastify.inject({
        method: 'POST',
        url: '/upload',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        payload: body
    });

describe('POST /upload', () => {
    let fastify;

    beforeEach(async () => {
        jest.clearAllMocks();
        minioClientModule.getMinIOClient.mockReturnValue(makeMinioMock());

        const Fastify = require('fastify');
        fastify = Fastify({ logger: false });
        await upload(fastify, {});
        await fastify.ready();
    });

    afterEach(async () => {
        await fastify.close();
    });

    // --- Input validation ---

    test('returns 400 when the request body has no file field', async () => {
        const response = await injectUpload(fastify, {});
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).success).toBe(false);
    });

    test('returns 400 for a filename containing forbidden characters (e.g. angle brackets)', async () => {
        const response = await injectUpload(fastify, makeFileBody('bad<name>.txt'));
        expect(response.statusCode).toBe(400);
    });

    test('returns 400 for a filename that has no extension', async () => {
        const response = await injectUpload(fastify, makeFileBody('noextension'));
        expect(response.statusCode).toBe(400);
    });

    test('returns 400 for a filename with a path separator (slash)', async () => {
        const response = await injectUpload(fastify, makeFileBody('folder/file.txt'));
        expect(response.statusCode).toBe(400);
    });

    // --- Authentication ---

    test('returns 401 when the Authorization header is absent', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/upload',
            headers: { 'Content-Type': 'application/json' },
            payload: makeFileBody()
        });
        expect(response.statusCode).toBe(401);
    });

    test('returns 401 when the JWT token is invalid or expired', async () => {
        jwt.verify.mockImplementation(() => { throw new Error('JsonWebTokenError'); });

        const response = await injectUpload(fastify, makeFileBody());
        expect(response.statusCode).toBe(401);
    });

    // --- Business rule: file limit ---

    test('returns 400 when the user already has 10 files', async () => {
        jwt.verify.mockReturnValue({ username: 'alice' });
        axios.get
            .mockResolvedValueOnce({ // getMinIOServerForUpload
                data: { success: true, message: [{ address: 'minio1', minIOServer_id: 1 }] }
            })
            .mockResolvedValueOnce({ // getFilenamesForUser → 10 existing files
                status: 200,
                data: { success: true, message: Array(10).fill({ name: 'file' }) }
            });

        const response = await injectUpload(fastify, makeFileBody());
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('maximum file limit');
    });

    // --- Business rule: duplicate filename ---

    test('returns 400 when the filename already exists for the authenticated user', async () => {
        jwt.verify.mockReturnValue({ username: 'alice' });
        axios.get
            .mockResolvedValueOnce({ // getMinIOServerForUpload
                data: { success: true, message: [{ address: 'minio1', minIOServer_id: 1 }] }
            })
            .mockResolvedValueOnce({ // getFilenamesForUser → 'document' already exists
                status: 200,
                data: { success: true, message: [{ name: 'document' }] }
            });

        // Upload 'document.pdf' whose basename is 'document' → duplicate
        const response = await injectUpload(fastify, makeFileBody('document.pdf'));
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('already exists');
    });

    // --- Happy path ---

    test('returns 200 with success and etag on a valid upload', async () => {
        jwt.verify.mockReturnValue({ username: 'alice' });
        axios.get
            .mockResolvedValueOnce({ // getMinIOServerForUpload
                data: { success: true, message: [{ address: 'minio1', minIOServer_id: 1 }] }
            })
            .mockResolvedValueOnce({ // getFilenamesForUser → no existing files
                status: 200,
                data: { success: true, message: [] }
            })
            .mockResolvedValueOnce({ // getAccountId
                data: { account_id: 42 }
            });
        axios.post.mockResolvedValue({ status: 200, data: { status: 'success' } }); // insertFileMetadata (via broker)

        const response = await injectUpload(fastify, makeFileBody('newfile.pdf'));

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.etag).toBeDefined();
    });

    test('creates the MinIO bucket when it does not exist', async () => {
        jwt.verify.mockReturnValue({ username: 'alice' });
        const minioMock = makeMinioMock();
        minioMock.bucketExists.mockResolvedValue(false); // bucket does not exist
        minioClientModule.getMinIOClient.mockReturnValue(minioMock);

        axios.get
            .mockResolvedValueOnce({ data: { success: true, message: [{ address: 'minio1', minIOServer_id: 1 }] } })
            .mockResolvedValueOnce({ status: 200, data: { success: true, message: [] } })
            .mockResolvedValueOnce({ data: { account_id: 42 } });
        axios.post.mockResolvedValue({ status: 200, data: { status: 'success' } });

        await injectUpload(fastify, makeFileBody('newfile.pdf'));

        expect(minioMock.makeBucket).toHaveBeenCalled();
    });

    test('valid filenames pass the filename validation', async () => {
        // These names should NOT trigger a 400 due to filename validation.
        // We verify by checking that auth is attempted (401), not filename error (400 with invalid chars).
        const validNames = ['report.pdf', 'My File-2024.docx', 'image_001.png', 'data.v2.csv'];

        for (const name of validNames) {
            const response = await injectUpload(fastify, makeFileBody(name));
            // A 401 means filename was valid and auth check was reached
            // A 400 means filename was rejected — unexpected
            expect(response.statusCode).not.toBe(400);
        }
    });
});
