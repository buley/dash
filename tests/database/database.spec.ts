import { databaseMethods } from '../../src/database';
import { DashContext } from '../../src/utilities';

describe('databaseMethods', () => {
    let mockObjectStore: {
        get: jest.Mock;
        put: jest.Mock;
        delete: jest.Mock;
    };

    beforeEach(() => {
        mockObjectStore = {
            get: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        };
    });

    describe('get', () => {
        it('should retrieve an entry from the database', async () => {
            const get_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                key: 'testKey',
            };

            const mockRequest = {
                onsuccess: null as any,
                onerror: null as any,
                result: 'testData',
            };

            mockObjectStore.get.mockReturnValue(mockRequest);

            const resultPromise = databaseMethods.get(get_ctx);
            mockRequest.onsuccess({ target: { result: 'testData' } } as any);

            const result = await resultPromise;
            expect(result.entry).toBe('testData');
        });

        it('should handle errors when retrieving an entry', async () => {
            const get_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                key: 'testKey',
            };

            const mockRequest = {
                onsuccess: null as any,
                onerror: null as any,
                error: new Error('Get Error'),
            };

            mockObjectStore.get.mockReturnValue(mockRequest);

            const resultPromise = databaseMethods.get(get_ctx);
            mockRequest.onerror({ target: { error: new Error('Get Error') } } as any);

            await expect(resultPromise).rejects.toMatchObject({
                error: { message: 'Get Error' },
            });
        });

        it('should reject if the entry is missing', async () => {
            const get_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                key: 'testKey',
            };

            const mockRequest = {
                onsuccess: null as any,
                onerror: null as any,
                result: undefined,
            };

            mockObjectStore.get.mockReturnValue(mockRequest);

            const resultPromise = databaseMethods.get(get_ctx);
            mockRequest.onsuccess({ target: { result: undefined } } as any);

            await expect(resultPromise).rejects.toMatchObject({
                error: { message: 'Missing entry', name: 'DashNoEntry' },
            });
        });
    });

    describe('put', () => {
        it('should put an entry in the database', async () => {
            const put_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                data: 'testData',
                key: 'testKey',
            };

            const mockRequest = {
                onsuccess: null as any,
                onerror: null as any,
                result: 'testKey',
            };

            mockObjectStore.put.mockReturnValue(mockRequest);

            const resultPromise = databaseMethods.put(put_ctx);
            mockRequest.onsuccess({ target: { result: 'testKey' } } as any);

            const result = await resultPromise;
            expect(result.key).toBe('testKey');
            expect(result.entry).toBe('testData');
        });

        it('should handle errors during put', async () => {
            const put_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                data: 'testData',
                key: 'testKey',
            };

            const mockRequest = {
                onsuccess: null as any,
                onerror: null as any,
                error: new Error('Put Error'),
            };

            mockObjectStore.put.mockReturnValue(mockRequest);

            const resultPromise = databaseMethods.put(put_ctx);
            mockRequest.onerror({ target: { error: new Error('Put Error') } } as any);

            await expect(resultPromise).rejects.toMatchObject({
                error: { message: 'Put Error' },
            });
        });
    });

    describe('remove', () => {
        it('should remove an entry from the database', async () => {
            const remove_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                key: 'testKey',
            };

            const mockRequest = {
                onsuccess: null as any,
                onerror: null as any,
            };

            mockObjectStore.delete.mockReturnValue(mockRequest);

            const resultPromise = databaseMethods.remove(remove_ctx);
            mockRequest.onsuccess({} as any);

            const result = await resultPromise;
            expect(result).toEqual(remove_ctx);
        });

        it('should handle errors during remove', async () => {
            const remove_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                key: 'testKey',
            };

            const mockRequest = {
                onsuccess: null as any,
                onerror: null as any,
                error: new Error('Remove Error'),
            };

            mockObjectStore.delete.mockReturnValue(mockRequest);

            const resultPromise = databaseMethods.remove(remove_ctx);
            mockRequest.onerror({ target: { error: new Error('Remove Error') } } as any);

            await expect(resultPromise).rejects.toMatchObject({
                error: { message: 'Remove Error' },
            });
        });
    });
});