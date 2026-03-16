'use strict';

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../MinIO/MinIOClient', () => ({
    getMinIOClient: jest.fn(),
    minioClient: {
        removeObject: jest.fn().mockResolvedValue(undefined)
    }
}));

const axios = require('axios');
const jwt = require('jsonwebtoken');
const minioClientModule = require('../MinIO/MinIOClient');

process.env.JWT_SECRET = 'test-secret';
process.env.NGINX_API = 'http://nginx';

const deleteFile = require('../MinIO/delete');

// A sample file metadata object as returned by MetaDBServer
const sampleFile = {
    name: 'myfile',
    file_type: 'pdf',
    username: 'alice',
    cluster_location_id: 1
};

// Shorthand to inject a DELETE /delete request
const injectDelete = (fastify, body, token = 'valid-token') =>
    fastify.inject({
        method: 'DELETE',
        url: '/delete',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        payload: body
    });

describe('DELETE /delete', () => {
    let fastify;

    beforeEach(async () => {
        jest.clearAllMocks();

        const Fastify = require('fastify');
        fastify = Fastify({ logger: false });
        await deleteFile(fastify, {});
        await fastify.ready();
    });

    afterEach(async () => {
        await fastify.close();
    });

    // --- Input validation ---

    test('returns 400 when file_id is missing from the request body', async () => {
        const response = await injectDelete(fastify, {});
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Missing required parameters');
    });

    // --- Authentication ---

    test('returns 401 when the Authorization header is absent', async () => {
        const response = await fastify.inject({
            method: 'DELETE',
            url: '/delete',
            headers: { 'Content-Type': 'application/json' },
            payload: { file_id: 99 }
        });
        expect(response.statusCode).toBe(401);
    });

    test('returns 401 when the JWT token is invalid', async () => {
        jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

        const response = await injectDelete(fastify, { file_id: 99 });
        expect(response.statusCode).toBe(401);
    });

    // --- File not found ---

    test('returns 500 when the metadata request fails — getFileMetadata always throws on failure', async () => {
        // getFileMetadata() wraps every non-success path in `throw new Error(...)` and
        // never returns null/undefined, so the `if (!fileMetadata)` 400 guard in the
        // route is dead code. All lookup failures surface as unhandled throws → 500.
        // This test documents that behaviour as a regression anchor.
        jwt.verify.mockReturnValue({ username: 'alice' });
        axios.get.mockRejectedValue(new Error('not found'));

        const response = await injectDelete(fastify, { file_id: 99 });
        expect(response.statusCode).toBe(500);
    });

    // --- Authorization ---

    test('returns 403 when the authenticated user does not own the file', async () => {
        jwt.verify.mockReturnValue({ username: 'bob' }); // bob is not the owner
        axios.get.mockResolvedValue({
            status: 200,
            data: { success: true, message: { ...sampleFile, username: 'alice' } }
        });

        const response = await injectDelete(fastify, { file_id: 1 });
        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.body).message).toContain('permission');
    });

    // --- Happy path ---

    test('returns 200 and deletes the file when the owner makes the request', async () => {
        jwt.verify.mockReturnValue({ username: 'alice' });
        axios.get.mockResolvedValue({
            status: 200,
            data: { success: true, message: sampleFile }
        });
        axios.post.mockResolvedValue({
            status: 200,
            data: { status: 'success' }
        });
        minioClientModule.minioClient.removeObject.mockResolvedValue(undefined);

        const response = await injectDelete(fastify, { file_id: 1 });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).success).toBe(true);
    });

    test('calls MinIO removeObject with the correct bucket and filename', async () => {
        jwt.verify.mockReturnValue({ username: 'alice' });
        axios.get.mockResolvedValue({
            status: 200,
            data: { success: true, message: sampleFile }
        });
        axios.post.mockResolvedValue({ status: 200, data: { status: 'success' } });
        minioClientModule.minioClient.removeObject.mockResolvedValue(undefined);

        await injectDelete(fastify, { file_id: 1 });

        // Bucket name is the lowercase username, filename is name.type
        expect(minioClientModule.minioClient.removeObject).toHaveBeenCalledWith(
            'alice',
            'myfile.pdf'
        );
    });

    test('queues a metadata deletion request to the Broker after removing from MinIO', async () => {
        jwt.verify.mockReturnValue({ username: 'alice' });
        axios.get.mockResolvedValue({
            status: 200,
            data: { success: true, message: sampleFile }
        });
        axios.post.mockResolvedValue({ status: 200, data: { status: 'success' } });
        minioClientModule.minioClient.removeObject.mockResolvedValue(undefined);

        await injectDelete(fastify, { file_id: 1 });

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/addQueue'),
            expect.objectContaining({
                type: 'METADBSERVER',
                message: expect.objectContaining({ operation: 'DELETEFILE' })
            }),
            expect.any(Object)
        );
    });
});
