'use strict';

jest.mock('axios');
jest.mock('../Scheduler/checkServer');
jest.mock('../Scheduler/getMinIOServer');
jest.mock('../logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

const axios = require('axios');
const checkServerModule = require('../Scheduler/checkServer');
const getMinIOServer = require('../Scheduler/getMinIOServer');
const scheduleTasks = require('../Scheduler/scheduleTasks');

// A sample server that is currently active (connection_failure_datetime = null)
const activeServer = {
    minIOServer_id: 1,
    address: 'minio1',
    connection_failure_datetime: null, // null → server is active
    cluster_id: 10,
    memory_limit_reached: 0           // 0 → memory limit NOT reached
};

// A sample server that is currently inactive (has a failure timestamp)
const inactiveServer = {
    ...activeServer,
    connection_failure_datetime: '2024-01-01T00:00:00Z'
};

describe('scheduleTasks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NGINX_API = 'http://nginx';
        axios.post.mockResolvedValue({ data: { success: true } });
    });

    test('does nothing when getMinIOServer returns failure', async () => {
        getMinIOServer.mockResolvedValue({ success: false });

        await scheduleTasks();

        expect(checkServerModule.checkServer).not.toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('calls checkServer once for each MinIO server returned', async () => {
        const servers = [activeServer, { ...activeServer, minIOServer_id: 2, address: 'minio2' }];
        getMinIOServer.mockResolvedValue({ success: true, message: servers });
        checkServerModule.checkServer.mockResolvedValue({ success: true, usagePercentage: 50 });

        await scheduleTasks();

        expect(checkServerModule.checkServer).toHaveBeenCalledTimes(2);
        expect(checkServerModule.checkServer).toHaveBeenCalledWith('minio1');
        expect(checkServerModule.checkServer).toHaveBeenCalledWith('minio2');
    });

    // --- handleServerChange ---

    test('posts updateMinIOServer when a previously inactive server becomes reachable', async () => {
        // inactiveServer has connection_failure_datetime set → serverActive = false
        // checkServer succeeds → active = true → state changed → should POST
        getMinIOServer.mockResolvedValue({ success: true, message: [inactiveServer] });
        checkServerModule.checkServer.mockResolvedValue({ success: true, usagePercentage: 50 });

        await scheduleTasks();

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/updateMinIOServer'),
            expect.objectContaining({ minIOServer_id: 1, active: true })
        );
    });

    test('posts updateMinIOServer when a previously active server becomes unreachable', async () => {
        // activeServer has connection_failure_datetime = null → serverActive = true
        // checkServer fails → active = false → state changed → should POST
        getMinIOServer.mockResolvedValue({ success: true, message: [activeServer] });
        checkServerModule.checkServer.mockResolvedValue({ success: false });

        await scheduleTasks();

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/updateMinIOServer'),
            expect.objectContaining({ minIOServer_id: 1, active: false })
        );
    });

    test('does NOT post updateMinIOServer when active server remains reachable', async () => {
        // activeServer → serverActive = true; checkServer succeeds → active = true; no change
        getMinIOServer.mockResolvedValue({ success: true, message: [activeServer] });
        checkServerModule.checkServer.mockResolvedValue({ success: true, usagePercentage: 50 });

        await scheduleTasks();

        const updateCalls = axios.post.mock.calls.filter(([url]) =>
            url.includes('/updateMinIOServer')
        );
        expect(updateCalls).toHaveLength(0);
    });

    test('does NOT post updateMinIOServer when inactive server remains unreachable', async () => {
        // inactiveServer → serverActive = false; checkServer fails → active = false; no change
        getMinIOServer.mockResolvedValue({ success: true, message: [inactiveServer] });
        checkServerModule.checkServer.mockResolvedValue({ success: false });

        await scheduleTasks();

        const updateCalls = axios.post.mock.calls.filter(([url]) =>
            url.includes('/updateMinIOServer')
        );
        expect(updateCalls).toHaveLength(0);
    });

    // --- handleSpace ---

    test('posts updateMemoryLimit when usage exceeds 95% and limit was not previously reached', async () => {
        // memory_limit_reached = 0 → currently NOT at limit
        // usagePercentage = 96 → serverSpace = true → state changed → should POST
        getMinIOServer.mockResolvedValue({ success: true, message: [activeServer] });
        checkServerModule.checkServer.mockResolvedValue({ success: true, usagePercentage: 96 });

        await scheduleTasks();

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/updateMemoryLimit'),
            expect.objectContaining({ cluster_id: 10, memory_limit_reached: true })
        );
    });

    test('posts updateMemoryLimit when usage drops below 95% and limit was previously reached', async () => {
        const serverAtLimit = { ...activeServer, memory_limit_reached: 1 };
        getMinIOServer.mockResolvedValue({ success: true, message: [serverAtLimit] });
        checkServerModule.checkServer.mockResolvedValue({ success: true, usagePercentage: 50 });

        await scheduleTasks();

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/updateMemoryLimit'),
            expect.objectContaining({ cluster_id: 10, memory_limit_reached: false })
        );
    });

    test('does NOT post updateMemoryLimit when usage is normal and limit was not reached', async () => {
        getMinIOServer.mockResolvedValue({ success: true, message: [activeServer] });
        checkServerModule.checkServer.mockResolvedValue({ success: true, usagePercentage: 50 });

        await scheduleTasks();

        const memCalls = axios.post.mock.calls.filter(([url]) =>
            url.includes('/updateMemoryLimit')
        );
        expect(memCalls).toHaveLength(0);
    });

    test('does NOT post updateMemoryLimit when usage is above 95% and limit was already reached', async () => {
        const serverAtLimit = { ...activeServer, memory_limit_reached: 1 };
        getMinIOServer.mockResolvedValue({ success: true, message: [serverAtLimit] });
        checkServerModule.checkServer.mockResolvedValue({ success: true, usagePercentage: 98 });

        await scheduleTasks();

        const memCalls = axios.post.mock.calls.filter(([url]) =>
            url.includes('/updateMemoryLimit')
        );
        expect(memCalls).toHaveLength(0);
    });
});
