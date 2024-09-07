
import storesMethods from '../../src/stores';
import { DashContext } from '../../src/utilities';

describe('storesMethods', () => {
    // Mock functions to be used in tests
    const mockSuccessCallback = jest.fn();
    const mockErrorCallback = jest.fn();

    beforeEach(() => {
        // Reset mock functions before each test
        mockSuccessCallback.mockReset();
        mockErrorCallback.mockReset();
    });

const mockDb = {
    name: 'mockDb',
    version: 1,
    objectStoreNames: ['store1', 'store2'],
    createObjectStore: jest.fn(() => ({
        createIndex: jest.fn(),
    })),
    deleteObjectStore: jest.fn(),
    transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
            clear: jest.fn(),
        })),
        db: {},
        mode: 'readwrite',
        error: null,
        onabort: null,
        oncomplete: null,
        onerror: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
    close: jest.fn(),
    onabort: null,
    onclose: null,
    onerror: null,
    onversionchange: null,
} as unknown as IDBDatabase;


    describe('get', () => {
        it('should retrieve object store names and call onSuccess', () => {
            const get_ctx: DashContext = { db: mockDb, onSuccess: mockSuccessCallback };

            storesMethods.get(get_ctx);

            expect(get_ctx.stores).toEqual(['store1', 'store2']);  // Check store names
            expect(mockSuccessCallback).toHaveBeenCalledWith(get_ctx);  // Success callback should be called
        });
    });

    describe('add', () => {
        it('should add a new object store and call onSuccess', () => {
            const mockRequest = {
                result: {
                    createObjectStore: jest.fn(() => ({
                        createIndex: jest.fn(),
                    })),
                },
            } as IDBRequest<any>;
        
            const add_ctx: DashContext = {
                request: mockRequest,  // Mock the request object and its result
                store: 'newStore',
                storeKeyPath: 'id',
                autoIncrement: true,
                indexes: [{ name: 'index1', keyPath: 'key1', unique: true }],
                onSuccess: mockSuccessCallback,
            };
        
            storesMethods.add(add_ctx);
        
            expect(mockRequest.result.createObjectStore).toHaveBeenCalledWith('newStore', { keyPath: 'id', autoIncrement: true });
            expect(mockSuccessCallback).toHaveBeenCalledWith(add_ctx);  // Success callback should be called
        });

        it('should throw an error if database is undefined', () => {
            const add_ctx: DashContext = { db: undefined, onError: mockErrorCallback };

            expect(() => storesMethods.add(add_ctx)).toThrow('Database is undefined');
        });
    });

    describe('remove', () => {
        it('should remove an object store and call onSuccess', () => {
            const remove_ctx: DashContext = { db: mockDb, store: 'storeToRemove', onSuccess: mockSuccessCallback };

            storesMethods.remove(remove_ctx);

            expect(mockDb.deleteObjectStore).toHaveBeenCalledWith('storeToRemove');
            expect(mockSuccessCallback).toHaveBeenCalledWith(remove_ctx);  // Success callback should be called
        });
    });

    describe('clearAll', () => {
        it('should clear all object stores and call onSuccess on transaction complete', () => {
            const mockTransaction = {
                objectStore: jest.fn(() => ({
                    clear: jest.fn(),
                })),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'complete') callback();  // Trigger complete event
                }),
                oncomplete: jest.fn(),
            };
        
            const mockDb = {
                name: 'mockDb',
                objectStoreNames: ['store1', 'store2'],
                transaction: jest.fn(() => mockTransaction),
                createObjectStore: jest.fn(),
                deleteObjectStore: jest.fn(),
            } as unknown as IDBDatabase;
        
            const clear_ctx: DashContext = { db: mockDb, onSuccess: mockSuccessCallback, onError: mockErrorCallback };
        
            storesMethods.clearAll(clear_ctx);
        
            expect(mockDb.transaction).toHaveBeenCalledWith(['store1', 'store2'], 'readwrite');
            expect(mockSuccessCallback).toHaveBeenCalledWith(clear_ctx);  // Success callback should be called
        });

        it('should call onError when transaction encounters an error', () => {
            const failingMockDb: unknown = {
                ...mockDb,
                transaction: jest.fn(() => ({
                    objectStore: jest.fn(() => ({
                        clear: jest.fn(),
                    })),
                    addEventListener: jest.fn((event, callback) => {
                        if (event === 'error') callback({ target: { error: new Error('Transaction Error') } });
                    }),
                })),
            };
            const clear_ctx: DashContext = { db: failingMockDb as IDBDatabase, onSuccess: mockSuccessCallback, onError: mockErrorCallback };

            storesMethods.clearAll(clear_ctx);

            expect(mockErrorCallback).toHaveBeenCalled();  // Error callback should be called
            expect(clear_ctx.error.message).toBe('Transaction Error');
        });
    });
});
