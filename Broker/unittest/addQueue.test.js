'use strict';

jest.mock('../Socket/connectionStorage');
jest.mock('../Queue/sync');
jest.mock('../logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

const connectionStorage = require('../Socket/connectionStorage');
const sync = require('../Queue/sync');
const addQueue = require('../REST/addQueue');

describe('POST /addQueue', () => {
    let fastify;

    beforeEach(async () => {
        jest.clearAllMocks();
        const Fastify = require('fastify');
        fastify = Fastify({ logger: false });
        await addQueue(fastify);
        await fastify.ready();
    });

    afterEach(async () => {
        await fastify.close();
    });

    test('returns 400 when the request body is missing', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/addQueue'
            // No body → request.body is null → !data is true
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).status).toBe('error');
    });

    test('returns 200 and queues the message for the correct clients', async () => {
        connectionStorage.getAllConnectionAddressesByType.mockReturnValue(['ws://meta1', 'ws://meta2']);
        sync.add.mockImplementation(() => {});

        const response = await fastify.inject({
            method: 'POST',
            url: '/addQueue',
            headers: { 'Content-Type': 'application/json' },
            payload: {
                type: 'METADBSERVER',
                message: { correlationId: 'abc123', data: {} }
            }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).status).toBe('success');
        expect(sync.add).toHaveBeenCalledWith(
            ['ws://meta1', 'ws://meta2'],
            [expect.objectContaining({ correlationId: 'abc123' })]
        );
    });

    test('excludes clients listed in the except field', async () => {
        connectionStorage.getAllConnectionAddressesByType.mockReturnValue([
            'ws://meta1', 'ws://meta2', 'ws://meta3'
        ]);
        sync.add.mockImplementation(() => {});

        await fastify.inject({
            method: 'POST',
            url: '/addQueue',
            headers: { 'Content-Type': 'application/json' },
            payload: {
                type: 'METADBSERVER',
                message: { correlationId: 'abc', data: {} },
                except: ['ws://meta2']
            }
        });

        const [calledClients] = sync.add.mock.calls[0];
        expect(calledClients).not.toContain('ws://meta2');
        expect(calledClients).toContain('ws://meta1');
        expect(calledClients).toContain('ws://meta3');
    });

    test('wraps a single message object in an array before queuing', async () => {
        connectionStorage.getAllConnectionAddressesByType.mockReturnValue(['ws://meta1']);
        sync.add.mockImplementation(() => {});

        await fastify.inject({
            method: 'POST',
            url: '/addQueue',
            headers: { 'Content-Type': 'application/json' },
            payload: {
                type: 'METADBSERVER',
                message: { correlationId: 'single', data: {} }
            }
        });

        const [, messages] = sync.add.mock.calls[0];
        expect(Array.isArray(messages)).toBe(true);
        expect(messages).toHaveLength(1);
    });

    test('passes an array of messages through as-is', async () => {
        connectionStorage.getAllConnectionAddressesByType.mockReturnValue(['ws://meta1']);
        sync.add.mockImplementation(() => {});

        await fastify.inject({
            method: 'POST',
            url: '/addQueue',
            headers: { 'Content-Type': 'application/json' },
            payload: {
                type: 'METADBSERVER',
                message: [
                    { correlationId: 'msg1', data: {} },
                    { correlationId: 'msg2', data: {} }
                ]
            }
        });

        const [, messages] = sync.add.mock.calls[0];
        expect(messages).toHaveLength(2);
        expect(messages[0]).toMatchObject({ correlationId: 'msg1' });
        expect(messages[1]).toMatchObject({ correlationId: 'msg2' });
    });

    test('calls getAllConnectionAddressesByType with the provided type', async () => {
        connectionStorage.getAllConnectionAddressesByType.mockReturnValue([]);
        sync.add.mockImplementation(() => {});

        await fastify.inject({
            method: 'POST',
            url: '/addQueue',
            headers: { 'Content-Type': 'application/json' },
            payload: { type: 'FILERSERVER', message: { data: {} } }
        });

        expect(connectionStorage.getAllConnectionAddressesByType).toHaveBeenCalledWith('FILERSERVER');
    });
});
