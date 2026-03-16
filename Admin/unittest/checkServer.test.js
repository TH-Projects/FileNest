'use strict';

const axios = require('axios');
jest.mock('axios');

const { checkServer } = require('../Scheduler/checkServer');

// Builds a fake MinIO metrics string with the given byte values
const makeMetrics = (totalBytes, freeBytes) =>
    `minio_cluster_health_capacity_usable_total_bytes ${totalBytes}\n` +
    `minio_cluster_health_capacity_usable_free_bytes ${freeBytes}`;

describe('checkServer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns success with correct usage percentage (50%)', async () => {
        axios.get.mockResolvedValue({
            data: makeMetrics('1.0e+10', '5.0e+09') // 5GB free out of 10GB = 50% used
        });

        const result = await checkServer('minio1');

        expect(result.success).toBe(true);
        expect(result.usagePercentage).toBeCloseTo(50);
    });

    test('returns success with 0% usage when storage is completely free', async () => {
        axios.get.mockResolvedValue({
            data: makeMetrics('1.0e+10', '1.0e+10') // all free
        });

        const result = await checkServer('minio1');

        expect(result.success).toBe(true);
        expect(result.usagePercentage).toBe(0);
    });

    test('returns success with ~100% usage when storage is almost full', async () => {
        axios.get.mockResolvedValue({
            data: makeMetrics('1.0e+10', '1.0e+08') // 1% free
        });

        const result = await checkServer('minio1');

        expect(result.success).toBe(true);
        expect(result.usagePercentage).toBeCloseTo(99);
    });

    test('queries the correct MinIO metrics endpoint for the given server address', async () => {
        axios.get.mockResolvedValue({
            data: makeMetrics('1.0e+10', '5.0e+09')
        });

        await checkServer('minio2');

        expect(axios.get).toHaveBeenCalledWith(
            'http://minio2:9000/minio/metrics/v3/cluster/health'
        );
    });

    test('returns failure when the server is unreachable', async () => {
        axios.get.mockRejectedValue(new Error('connection refused'));

        const result = await checkServer('minio1');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to check server');
    });

    test('returns failure when the HTTP response times out', async () => {
        axios.get.mockRejectedValue(new Error('timeout'));

        const result = await checkServer('minio1');

        expect(result.success).toBe(false);
    });
});
