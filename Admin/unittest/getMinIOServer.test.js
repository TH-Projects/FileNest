'use strict';

jest.mock('axios');

describe('getMinIOServer', () => {
    // Both `axios` and `getMinIOServer` are re-required after each resetModules() so
    // the test always holds the same mock instance that the module under test uses.
    let getMinIOServer;
    let axios;

    beforeEach(() => {
        jest.resetModules();
        process.env.NGINX_API = 'http://nginx';
        axios = require('axios');
        getMinIOServer = require('../Scheduler/getMinIOServer');
    });

    test('returns the server list on a successful response', async () => {
        const servers = [
            { address: 'minio1', minIOServer_id: 1 },
            { address: 'minio2', minIOServer_id: 2 }
        ];
        axios.get.mockResolvedValue({ data: { success: true, message: servers } });

        const result = await getMinIOServer();

        expect(result.success).toBe(true);
        expect(result.message).toEqual(servers);
    });

    test('calls the correct endpoint using NGINX_API env variable', async () => {
        axios.get.mockResolvedValue({ data: { success: true, message: [] } });

        await getMinIOServer();

        expect(axios.get).toHaveBeenCalledWith('http://nginx/allMinIOServer');
    });

    test('returns {success: false} when the network request fails', async () => {
        axios.get.mockRejectedValue(new Error('network error'));

        const result = await getMinIOServer();

        expect(result.success).toBe(false);
    });

    test('returns the full API response data (passes through the response body)', async () => {
        axios.get.mockResolvedValue({ data: { success: false, message: 'No servers found' } });

        const result = await getMinIOServer();

        // The function returns response.data directly
        expect(result.success).toBe(false);
        expect(result.message).toBe('No servers found');
    });
});
