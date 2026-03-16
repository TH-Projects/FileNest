'use strict';

jest.mock('../DB/connection');
jest.mock('../logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

const connection = require('../DB/connection');
const { getUser, createUser, checkUsername, checkEmail, getAccountIdByUsername } = require('../DB/user');

// Helper: sets up a mock DB connection whose query function returns the given values in order
const mockDb = (queryMock) => {
    connection.getConnection.mockResolvedValue({
        query: queryMock,
        release: jest.fn()
    });
};

describe('DB User Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── getUser ──────────────────────────────────────────────────────────────

    describe('getUser', () => {
        test('returns success when the username and password match', async () => {
            mockDb(jest.fn().mockResolvedValue([{ username: 'alice', password: 'hashed123' }]));

            const result = await getUser('alice', 'hashed123');

            expect(result.success).toBe(true);
        });

        test('returns failure when no account exists for the given username', async () => {
            mockDb(jest.fn().mockResolvedValue([]));

            const result = await getUser('alice', 'hashed123');

            expect(result.success).toBe(false);
        });

        test('returns failure when the password hash does not match', async () => {
            mockDb(jest.fn().mockResolvedValue([{ username: 'alice', password: 'differenthash' }]));

            const result = await getUser('alice', 'hashed123');

            expect(result.success).toBe(false);
        });

        test('returns failure when the database throws an error', async () => {
            connection.getConnection.mockRejectedValue(new Error('db connection error'));

            const result = await getUser('alice', 'hashed123');

            expect(result.success).toBe(false);
        });

        test('queries by username only (not by password in SQL)', async () => {
            const queryFn = jest.fn().mockResolvedValue([{ username: 'alice', password: 'pw' }]);
            mockDb(queryFn);

            await getUser('alice', 'pw');

            expect(queryFn).toHaveBeenCalledWith(
                expect.stringContaining('WHERE username = ?'),
                ['alice']
            );
        });
    });

    // ─── createUser ───────────────────────────────────────────────────────────

    describe('createUser', () => {
        test('inserts a new user and returns success', async () => {
            // Call order: createUser → getConnection → checkUsername → getConnection → query (SELECT COUNT)
            //                                                                        → return { count: 0 }
            //             createUser → query (INSERT) → { insertId: 7 }
            // Both getConnection() calls return the same mock db, so queryFn is shared.
            const queryFn = jest.fn()
                .mockResolvedValueOnce([{ count: 0 }]) // checkUsername SELECT → no existing user
                .mockResolvedValueOnce({ insertId: 7 }); // INSERT
            mockDb(queryFn);

            const result = await createUser('alice', 'hashedpw', 'alice@example.com');

            expect(result.success).toBe(true);
        });

        test('returns failure when the database connection fails', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await createUser('alice', 'hashedpw', 'alice@example.com');

            expect(result.success).toBe(false);
        });

        test('uses parameterized queries to prevent SQL injection', async () => {
            const queryFn = jest.fn()
                .mockResolvedValueOnce([{ count: 0 }]) // checkUsername → no existing user
                .mockResolvedValueOnce({ insertId: 1 }); // INSERT
            mockDb(queryFn);

            await createUser('alice', 'hashedpw', 'alice@example.com');

            const insertCall = queryFn.mock.calls.find(([sql]) => sql.includes('INSERT'));
            expect(insertCall).toBeDefined();
            // Parameters should be passed as an array, not interpolated into the SQL string
            expect(insertCall[1]).toContain('alice');
            expect(insertCall[1]).toContain('hashedpw');
            expect(insertCall[1]).toContain('alice@example.com');
        });
    });

    // ─── checkUsername ────────────────────────────────────────────────────────

    describe('checkUsername', () => {
        test('returns {count: 1} when a user with that username exists', async () => {
            mockDb(jest.fn().mockResolvedValue([{ count: 1 }]));

            const result = await checkUsername('alice');

            expect(result.count).toBe(1);
        });

        test('returns {count: 0} when no user has that username', async () => {
            mockDb(jest.fn().mockResolvedValue([{ count: 0 }]));

            const result = await checkUsername('newuser');

            expect(result.count).toBe(0);
        });

        test('returns [] (error fallback) when the database throws', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await checkUsername('alice');

            // Error path returns []
            expect(Array.isArray(result)).toBe(true);
        });
    });

    // ─── checkEmail ───────────────────────────────────────────────────────────

    describe('checkEmail', () => {
        test('returns {count: 1} when a user with that email exists', async () => {
            mockDb(jest.fn().mockResolvedValue([{ count: 1 }]));

            const result = await checkEmail('alice@example.com');

            expect(result.count).toBe(1);
        });

        test('returns {count: 0} when no user has that email', async () => {
            mockDb(jest.fn().mockResolvedValue([{ count: 0 }]));

            const result = await checkEmail('new@example.com');

            expect(result.count).toBe(0);
        });

        test('returns {count: 0} as a safe fallback when the database throws', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await checkEmail('alice@example.com');

            expect(result.count).toBe(0);
        });
    });

    // ─── getAccountIdByUsername ───────────────────────────────────────────────

    describe('getAccountIdByUsername', () => {
        test('returns success with the account_id when the user exists', async () => {
            mockDb(jest.fn().mockResolvedValue([{ account_id: 42 }]));

            const result = await getAccountIdByUsername('alice');

            expect(result.success).toBe(true);
            expect(result.message).toBe(42);
        });

        test('returns failure when no account is found for the username', async () => {
            mockDb(jest.fn().mockResolvedValue([]));

            const result = await getAccountIdByUsername('ghost');

            expect(result.success).toBe(false);
        });

        test('returns failure when the database throws an error', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await getAccountIdByUsername('alice');

            expect(result.success).toBe(false);
        });
    });
});
