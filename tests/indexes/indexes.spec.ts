
import indexesMethods from '../../src/indexes';
import { DashContext } from '../../src/utilities';

describe('indexesMethods', () => {
    let mockSuccessCallback: jest.Mock;
    let mockErrorCallback: jest.Mock;
    let mockCompleteCallback: jest.Mock;

    beforeEach(() => {
        mockSuccessCallback = jest.fn();
        mockErrorCallback = jest.fn();
        mockCompleteCallback = jest.fn();
    });

    describe('get', () => {
        it('should retrieve indexes from the object store and call onSuccess', async () => {
            const mockObjectStore = {
                indexNames: ['index1', 'index2']
            };

            const get_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                onSuccess: mockSuccessCallback
            };

            await indexesMethods.get(get_ctx);

            expect(get_ctx.indexes).toEqual(['index1', 'index2']);
            expect(mockSuccessCallback).toHaveBeenCalledWith(get_ctx);
        });
    });

    describe('add', () => {
        it('should add an index to the object store and call onSuccess', async () => {
            const mockObjectStore = {
                createIndex: jest.fn()
            };

            const add_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'newIndex',
                indexKeyPath: 'keyPath',
                indexUnique: true,
                onSuccess: mockSuccessCallback
            };

            await indexesMethods.add(add_ctx);

            expect(mockObjectStore.createIndex).toHaveBeenCalledWith('newIndex', 'keyPath', {
                unique: true,
                multiEntry: false
            });
            expect(mockSuccessCallback).toHaveBeenCalledWith(add_ctx);
        });
    });

    describe('remove', () => {
        it('should remove an index from the object store and call onSuccess', async () => {
            const mockObjectStore = {
                deleteIndex: jest.fn()
            };

            const remove_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'indexToRemove',
                onSuccess: mockSuccessCallback
            };

            await indexesMethods.remove(remove_ctx);

            expect(mockObjectStore.deleteIndex).toHaveBeenCalledWith('indexToRemove');
            expect(mockSuccessCallback).toHaveBeenCalledWith(remove_ctx);
        });
    });

    describe('getEntries', () => {
        it('should retrieve entries from an index and call onSuccess for each entry and onComplete at the end', async () => {
            jest.setTimeout(10000);  // Increase timeout to 10 seconds

            let callCount = 0;
            const mockEntries = [
                { id: 1, name: 'Entry1' },
                { id: 2, name: 'Entry2' }
            ];
        
            const mockCursor = {
                value: mockEntries[0],
                continue: jest.fn(() => {
                    callCount++;
                    if (callCount >= mockEntries.length) {
                        mockRequest.result = null;  // Simulate end of the cursor
                    } else {
                        mockCursor.value = mockEntries[callCount];
                    }
                    mockRequest.onsuccess(new Event('success'));
                }),
            };
        
            const mockRequest = {
                result: mockCursor as { value: { id: number; name: string; }; continue: jest.Mock<void, [], any>; } | null,
                onsuccess: (ev: Event) => {
                    // your code here
                },
            };
        
            const mockObjectStore = {
                index: jest.fn(() => ({
                    openCursor: jest.fn(() => mockRequest),
                })),
            };
        
            const mockSuccessCallback = jest.fn();
            const mockCompleteCallback = jest.fn();
        
            const get_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'indexName',
                onSuccess: mockSuccessCallback,
                onComplete: mockCompleteCallback,
            };
        
            const getEntriesPromise = indexesMethods.getEntries(get_ctx);
        
            // Trigger the first onsuccess callback
            if (mockRequest.onsuccess) {
                mockRequest.onsuccess(new Event('success'));
            }
        
            await getEntriesPromise;
        
            expect(mockObjectStore.index).toHaveBeenCalledWith('indexName');
            expect(mockSuccessCallback).toHaveBeenCalledTimes(2);  // Called for two entries
            expect(mockSuccessCallback).toHaveBeenNthCalledWith(1, mockEntries[0]);
            expect(mockSuccessCallback).toHaveBeenNthCalledWith(2, mockEntries[1]);
            expect(mockCompleteCallback).toHaveBeenCalledWith(get_ctx);
        });
        
    });

    describe('countEntries', () => {
        it('should count entries in the object store index and call onSuccess', async () => {
            const mockObjectStore = {
                index: jest.fn().mockReturnValue({
                    count: jest.fn().mockReturnValue({
                        addEventListener: (event: string, callback: () => void) => {
                            if (event === 'success') callback();
                        },
                        result: 5
                    })
                })
            };
    
            const count_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'testIndex',
                onSuccess: mockSuccessCallback
            };
    
            await indexesMethods.countEntries(count_ctx);
    
            expect(mockObjectStore.index).toHaveBeenCalledWith('testIndex');
            expect(mockSuccessCallback).toHaveBeenCalledWith(count_ctx);
            expect(count_ctx.total).toBe(5);
        });
    
        
        it('should handle errors and call onError', async () => {
            const mockObjectStore = {
                index: jest.fn().mockReturnValue({
                    count: jest.fn().mockReturnValue({
                        addEventListener: (event: string, callback: (event: any) => void) => {
                            if (event === 'error') {
                                const mockErrorEvent = { target: { error: new Error('Test Error') } };
                                callback(mockErrorEvent);
                            }
                        }
                    })
                })
            };
        
            const count_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'testIndex',
                onError: mockErrorCallback
            };
        
            try {
                // Await the function call
                await indexesMethods.countEntries(count_ctx);
            } catch (ctx: any) {
                // Expect the error to be part of the returned context
                expect(ctx.error).toEqual(new Error('Test Error'));
        
                // Ensure the error callback is called with the correct context
                expect(mockErrorCallback).toHaveBeenCalledWith(count_ctx);
            }
        });
        
        
    });
    
});
