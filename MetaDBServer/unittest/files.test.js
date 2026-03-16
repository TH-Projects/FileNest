'use strict';

jest.mock('../DB/connection');
jest.mock('../DB/minIOServer', () => ({
    getClusterForMinIOServer: jest.fn()
}));
jest.mock('../logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

const connection = require('../DB/connection');
const minIOServer = require('../DB/minIOServer');
const { getFiles, getFile, deleteFile, addFile, getFilenamesForUsername } = require('../DB/files');

// Helper: returns a mock DB object whose query function returns the given mock
const mockDb = (queryMock) => {
    connection.getConnection.mockResolvedValue({
        query: queryMock,
        release: jest.fn()
    });
};

describe('DB Files Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── getFiles ─────────────────────────────────────────────────────────────

    describe('getFiles', () => {
        test('returns success with all file records', async () => {
            const files = [
                { file_id: 1, name: 'report', file_type: 'pdf', username: 'alice' },
                { file_id: 2, name: 'photo', file_type: 'jpg', username: 'bob' }
            ];
            mockDb(jest.fn().mockResolvedValue(files));

            const result = await getFiles();

            expect(result.success).toBe(true);
            expect(result.message).toEqual(files);
        });

        test('returns success with empty array when no files exist', async () => {
            mockDb(jest.fn().mockResolvedValue([]));

            const result = await getFiles();

            expect(result.success).toBe(true);
            expect(result.message).toHaveLength(0);
        });

        test('returns failure when the database throws', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await getFiles();

            expect(result.success).toBe(false);
        });
    });

    // ─── getFile ──────────────────────────────────────────────────────────────

    describe('getFile', () => {
        test('returns the first matching file when found', async () => {
            const row = { file_id: 1, name: 'report', file_type: 'pdf', username: 'alice' };
            mockDb(jest.fn().mockResolvedValue([row]));

            const result = await getFile(1);

            expect(result.success).toBe(true);
            // When result is found, message is the first row (not an array)
            expect(result.message).toEqual(row);
        });

        test('returns success with empty array when file_id does not exist', async () => {
            mockDb(jest.fn().mockResolvedValue([]));

            const result = await getFile(999);

            expect(result.success).toBe(true);
            expect(result.message).toHaveLength(0);
        });

        test('returns failure when the database throws', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await getFile(1);

            expect(result.success).toBe(false);
        });

        test('queries by file_id using parameterized statement', async () => {
            const queryFn = jest.fn().mockResolvedValue([{ file_id: 1, name: 'report' }]);
            mockDb(queryFn);

            await getFile(1);

            expect(queryFn).toHaveBeenCalledWith(
                expect.stringContaining('WHERE f.file_id = ?'),
                [1]
            );
        });
    });

    // ─── getFilenamesForUsername ───────────────────────────────────────────────

    describe('getFilenamesForUsername', () => {
        test('returns file names for the given username', async () => {
            const rows = [{ name: 'doc', username: 'alice' }];
            mockDb(jest.fn().mockResolvedValue(rows));

            const result = await getFilenamesForUsername('alice');

            expect(result.success).toBe(true);
            expect(result.message).toEqual(rows);
        });

        test('returns empty message array when user has no files', async () => {
            mockDb(jest.fn().mockResolvedValue([]));

            const result = await getFilenamesForUsername('alice');

            expect(result.success).toBe(true);
            expect(result.message).toHaveLength(0);
        });

        test('returns failure on database error', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await getFilenamesForUsername('alice');

            expect(result.success).toBe(false);
        });
    });

    // ─── deleteFile ───────────────────────────────────────────────────────────

    describe('deleteFile', () => {
        test('returns success after deleting the file record', async () => {
            mockDb(jest.fn().mockResolvedValue({ affectedRows: 1 }));

            const result = await deleteFile(1);

            expect(result.success).toBe(true);
        });

        test('includes affected row count in the success message', async () => {
            mockDb(jest.fn().mockResolvedValue({ affectedRows: 1 }));

            const result = await deleteFile(1);

            expect(result.message).toContain('1');
        });

        test('returns failure when the database throws', async () => {
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await deleteFile(1);

            expect(result.success).toBe(false);
        });

        test('uses a parameterized DELETE query', async () => {
            const queryFn = jest.fn().mockResolvedValue({ affectedRows: 1 });
            mockDb(queryFn);

            await deleteFile(5);

            expect(queryFn).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM File WHERE file_id = ?'),
                [5]
            );
        });
    });

    // ─── addFile ──────────────────────────────────────────────────────────────

    describe('addFile', () => {
        test('returns success with insertId when the cluster is found and INSERT succeeds', async () => {
            minIOServer.getClusterForMinIOServer.mockResolvedValue({
                success: true,
                message: { cluster_id: 3 }
            });
            mockDb(jest.fn().mockResolvedValue({ insertId: 42 }));

            const result = await addFile(
                'etag-abc', 'report', 'pdf', 1024,
                '2024-01-01 10:00:00', 1, 1, 'application/pdf'
            );

            expect(result.success).toBe(true);
            expect(result.message).toBe(42);
        });

        test('returns failure when the MinIO cluster lookup fails', async () => {
            minIOServer.getClusterForMinIOServer.mockResolvedValue({
                success: false,
                message: 'Cluster not found'
            });

            const result = await addFile(
                'etag-abc', 'report', 'pdf', 1024,
                '2024-01-01 10:00:00', 1, 1, 'application/pdf'
            );

            expect(result.success).toBe(false);
        });

        test('returns failure when the database INSERT throws', async () => {
            minIOServer.getClusterForMinIOServer.mockResolvedValue({
                success: true,
                message: { cluster_id: 3 }
            });
            connection.getConnection.mockRejectedValue(new Error('db error'));

            const result = await addFile(
                'etag-abc', 'report', 'pdf', 1024,
                '2024-01-01 10:00:00', 1, 1, 'application/pdf'
            );

            expect(result.success).toBe(false);
        });
    });
});
