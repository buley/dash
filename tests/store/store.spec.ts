
import storeMethods from '../../src/store';
import { DashContext } from '../../src/utilities';

describe('storeMethods', () => {
    // Mock functions to be used in tests
    const mockSuccessCallback = jest.fn();
    const mockErrorCallback = jest.fn();

    beforeEach(() => {
        // Reset mock functions before each test
        mockSuccessCallback.mockReset();
        mockErrorCallback.mockReset();
    });

    describe('clear', () => {
        it('should clear the object store and call onSuccess', async () => {
            const mockRequest = {
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'success') {
                        setTimeout(() => {
                            callback();
                        }, 0);  // Simulate async success event
                    }
                }),
            };
        
            const clear_ctx: DashContext = {
                objectstore: {
                    clear: jest.fn(() => mockRequest),
                } as unknown as IDBObjectStore,
                onSuccess: mockSuccessCallback,
            };
        
            await storeMethods.clear(clear_ctx);
            expect(clear_ctx.objectstore?.clear).toHaveBeenCalled();
            expect(mockSuccessCallback).toHaveBeenCalledWith(clear_ctx);
        });
        

        it('should handle errors when clearing the object store', () => {
            const mockRequest = { addEventListener: jest.fn((event: string, callback: EventListenerOrEventListenerObject) => {
                if (event === 'error') (callback as EventListener)({ target: { error: new Error('Clear Error') } } as any);
            }) };

            const clear_ctx: DashContext = {
                objectstore: {
                    clear: jest.fn(() => mockRequest),
                } as unknown as IDBObjectStore,
                onError: mockErrorCallback,
            };

            return storeMethods.clear(clear_ctx).catch((ctx: DashContext) => {
                expect(clear_ctx.objectstore?.clear).toHaveBeenCalled();
                expect(mockErrorCallback).toHaveBeenCalledWith(ctx);
                expect(ctx.error.message).toBe('Clear Error');
            });
        });
    });

    describe('remove', () => {
        it('should remove an entry from the object store and call onSuccess', () => {
            const mockRequest = { addEventListener: jest.fn((event: string, callback: EventListenerOrEventListenerObject) => {
                if (event === 'success') (callback as EventListener)(new Event('success'));
            }) };

            const remove_ctx: DashContext = {
                objectstore: {
                    delete: jest.fn(() => mockRequest),
                } as unknown as IDBObjectStore,
                key: 'testKey',
                onSuccess: mockSuccessCallback,
            };

            return storeMethods.remove(remove_ctx).then((ctx: DashContext) => {
                expect(remove_ctx.objectstore?.delete).toHaveBeenCalledWith('testKey');
                expect(mockSuccessCallback).toHaveBeenCalledWith(ctx);
            });
        });

        it('should handle errors when removing an entry', () => {
            const mockRequest = { addEventListener: jest.fn((event: string, callback: EventListenerOrEventListenerObject) => {
                if (event === 'error') (callback as EventListener)({ target: { error: new Error('Remove Error') } } as any);
            }) };

            const remove_ctx: DashContext = {
                objectstore: {
                    delete: jest.fn(() => mockRequest),
                } as unknown as IDBObjectStore,
                key: 'testKey',
                onError: mockErrorCallback,
            };

            return storeMethods.remove(remove_ctx).catch((ctx: DashContext) => {
                expect(remove_ctx.objectstore?.delete).toHaveBeenCalledWith('testKey');
                expect(mockErrorCallback).toHaveBeenCalledWith(ctx);
                expect(ctx.error.message).toBe('Remove Error');
            });
        });
    });

    describe('get', () => {
        it('should retrieve an entry from the object store and call onSuccess', () => {
            const mockRequest = { addEventListener: jest.fn((event: string, callback: EventListenerOrEventListenerObject) => {
                if (event === 'success') (callback as EventListener)(new Event('success'));
            }), result: 'testEntry' };

            const get_ctx: DashContext = {
                objectstore: {
                    get: jest.fn(() => mockRequest),
                } as unknown as IDBObjectStore,
                key: 'testKey',
                onSuccess: mockSuccessCallback,
            };

            return storeMethods.get(get_ctx).then((ctx: DashContext) => {
                expect(get_ctx.objectstore?.get).toHaveBeenCalledWith('testKey');
                expect(mockSuccessCallback).toHaveBeenCalledWith(ctx);
                expect(ctx.entry).toBe('testEntry');
            });
        });

        it('should handle errors when retrieving an entry', () => {
            const mockRequest = { addEventListener: jest.fn((event: string, callback: EventListenerOrEventListenerObject) => {
                if (event === 'error') (callback as EventListener)({ target: { error: new Error('Get Error') } } as any);
            }) };

            const get_ctx: DashContext = {
                objectstore: {
                    get: jest.fn(() => mockRequest),
                } as unknown as IDBObjectStore,
                key: 'testKey',
                onError: mockErrorCallback,
            };

            return storeMethods.get(get_ctx).catch((ctx: DashContext) => {
                expect(get_ctx.objectstore?.get).toHaveBeenCalledWith('testKey');
                expect(mockErrorCallback).toHaveBeenCalledWith(ctx);
                expect(ctx.error.message).toBe('Get Error');
            });
        });

        it('should reject if the entry is missing', () => {
            const mockRequest = { addEventListener: jest.fn((event: string, callback: EventListenerOrEventListenerObject) => {
                if (event === 'success') (callback as EventListener)(new Event('success'));
            }), result: undefined };

            const get_ctx: DashContext = {
                objectstore: {
                    get: jest.fn(() => mockRequest),
                } as unknown as IDBObjectStore,
                key: 'testKey',
                onError: mockErrorCallback,
            };

            return storeMethods.get(get_ctx).catch((ctx: DashContext) => {
                expect(get_ctx.objectstore?.get).toHaveBeenCalledWith('testKey');
                expect(mockErrorCallback).toHaveBeenCalledWith(ctx);
                expect(ctx.error.message).toBe('missing');
                expect(ctx.error.name).toBe('DashNoEntry');
            });
        });
    });
});
