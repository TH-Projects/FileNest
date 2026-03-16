'use strict';

jest.mock('../DB/user');
jest.mock('../logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

const user = require('../DB/user');

process.env.JWT_SECRET = 'test-secret';

const loginUserRoute = require('../REST/loginUser');

describe('POST /loginUser', () => {
    let fastify;

    beforeEach(async () => {
        jest.clearAllMocks();

        const Fastify = require('fastify');
        fastify = Fastify({ logger: false });
        await loginUserRoute(fastify);
        await fastify.ready();
    });

    afterEach(async () => {
        await fastify.close();
    });

    // ─── Input validation ─────────────────────────────────────────────────────

    test('returns 400 when username is missing', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/loginUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { password: 'Secret1!' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Username');
    });

    test('returns 400 when password is missing', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/loginUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toContain('Password');
    });

    // ─── Authentication failure ────────────────────────────────────────────────

    test('returns 401 when credentials are invalid', async () => {
        user.getUser.mockResolvedValue({ success: false, message: 'No user found' });

        const response = await fastify.inject({
            method: 'POST',
            url: '/loginUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', password: 'wrongpassword' }
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).success).toBe(false);
    });

    // ─── Successful login ──────────────────────────────────────────────────────

    test('returns 200 with a JWT token when credentials are valid', async () => {
        user.getUser.mockResolvedValue({ success: true });

        const response = await fastify.inject({
            method: 'POST',
            url: '/loginUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', password: 'hashedpassword' }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.token).toBeDefined();
        expect(typeof body.token).toBe('string');
    });

    test('the returned token contains the username as a claim', async () => {
        user.getUser.mockResolvedValue({ success: true });

        const response = await fastify.inject({
            method: 'POST',
            url: '/loginUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', password: 'hashedpassword' }
        });

        const { token } = JSON.parse(response.body);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, 'test-secret');
        expect(decoded.username).toBe('alice');
    });

    test('calls getUser with the provided username and password', async () => {
        user.getUser.mockResolvedValue({ success: true });

        await fastify.inject({
            method: 'POST',
            url: '/loginUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', password: 'myhash' }
        });

        expect(user.getUser).toHaveBeenCalledWith('alice', 'myhash');
    });

    // ─── Database failure ─────────────────────────────────────────────────────

    test('returns 401 (not 500) when the database call throws — authenticateUser catches errors internally', async () => {
        // authenticateUser() has its own try/catch that swallows DB errors and
        // returns { success: false }, which the route handler maps to a 401.
        // This test documents that behaviour so a future refactor that changes
        // the error-handling contract will be caught immediately.
        user.getUser.mockRejectedValue(new Error('unexpected db failure'));

        const response = await fastify.inject({
            method: 'POST',
            url: '/loginUser',
            headers: { 'Content-Type': 'application/json' },
            payload: { username: 'alice', password: 'pw' }
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).success).toBe(false);
    });
});
