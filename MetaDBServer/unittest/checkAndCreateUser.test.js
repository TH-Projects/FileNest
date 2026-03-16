'use strict';

jest.mock('axios');
jest.mock('../DB/user');

const axios = require('axios');
const userDb = require('../DB/user');

process.env.NGINX_API = 'http://nginx';

const createUserRoutes = require('../REST/checkAndCreateUser');

describe('POST /checkAndCreateUser', () => {
    let fastify;

    beforeEach(async () => {
        jest.clearAllMocks();

        const Fastify = require('fastify');
        fastify = Fastify({ logger: false });
        await createUserRoutes(fastify);
        await fastify.ready();
    });

    afterEach(async () => {
        await fastify.close();
    });

    // ─── Username validation ──────────────────────────────────────────────────

    test('returns 400 when username contains spaces', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice bob', email: 'alice@test.com', password: 'Secret1!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Username');
    });

    test('returns 400 when username contains special characters', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice!', email: 'alice@test.com', password: 'Secret1!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Username');
    });

    test('accepts a username with only letters and digits', async () => {
        // A valid username should pass validation and move on to password check
        userDb.checkUsername.mockResolvedValue({ count: 0 });
        userDb.checkEmail.mockResolvedValue({ count: 0 });
        axios.post.mockResolvedValue({ data: { status: 'success' } });

        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'Alice123', email: 'alice@test.com', password: 'Secret1!' }
        });

        // Should not be rejected by username validation (400 mentioning 'Username')
        expect(JSON.parse(response.body).message).not.toContain('Username can only');
    });

    // ─── Password validation ──────────────────────────────────────────────────

    test('returns 400 when password is shorter than 8 characters', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'alice@test.com', password: 'Ab1!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Password');
    });

    test('returns 400 when password has no uppercase letter', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'alice@test.com', password: 'secret1!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Password');
    });

    test('returns 400 when password has no digit', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'alice@test.com', password: 'SecretPass!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Password');
    });

    test('returns 400 when password has no special character', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'alice@test.com', password: 'Secret123' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Password');
    });

    // ─── Uniqueness checks ────────────────────────────────────────────────────

    test('returns 400 when the username is already taken', async () => {
        userDb.checkUsername.mockResolvedValue({ count: 1 }); // username exists
        userDb.checkEmail.mockResolvedValue({ count: 0 });

        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'new@test.com', password: 'Secret1!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('alice');
    });

    test('returns 400 when the email is already registered', async () => {
        userDb.checkUsername.mockResolvedValue({ count: 0 });
        userDb.checkEmail.mockResolvedValue({ count: 1 }); // email exists

        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'taken@test.com', password: 'Secret1!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('taken@test.com');
    });

    // ─── Happy path ───────────────────────────────────────────────────────────

    test('returns 201 when all data is valid and unique', async () => {
        userDb.checkUsername.mockResolvedValue({ count: 0 });
        userDb.checkEmail.mockResolvedValue({ count: 0 });
        axios.post.mockResolvedValue({ data: { status: 'success' } });

        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'alice@test.com', password: 'Secret1!' }
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).success).toBe(true);
    });

    test('hashes the password before sharing it (does not send plaintext to broker)', async () => {
        userDb.checkUsername.mockResolvedValue({ count: 0 });
        userDb.checkEmail.mockResolvedValue({ count: 0 });
        axios.post.mockResolvedValue({ data: { status: 'success' } });

        await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'alice@test.com', password: 'Secret1!' }
        });

        const [, sentData] = axios.post.mock.calls[0];
        const sentPassword = sentData.message.data.password;
        // The sent password must NOT be the plaintext password
        expect(sentPassword).not.toBe('Secret1!');
        // It should be a hex string (SHA-256 produces 64 hex chars)
        expect(sentPassword).toMatch(/^[a-f0-9]{64}$/);
    });

    test('returns 500 when the broker request fails', async () => {
        userDb.checkUsername.mockResolvedValue({ count: 0 });
        userDb.checkEmail.mockResolvedValue({ count: 0 });
        axios.post.mockResolvedValue({ data: { status: 'error' } }); // broker returns error

        const response = await fastify.inject({
            method: 'POST',
            url: '/checkAndCreateUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', email: 'alice@test.com', password: 'Secret1!' }
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).success).toBe(false);
    });
});
