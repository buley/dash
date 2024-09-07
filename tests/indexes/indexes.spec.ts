
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
        it('should retrieve indexes from the object store and call on_success', async () => {
            const mockObjectStore = {
                indexNames: ['index1', 'index2']
            };

            const get_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                on_success: mockSuccessCallback
            };

            await indexesMethods.get(get_ctx);

            expect(get_ctx.indexes).toEqual(['index1', 'index2']);
            expect(mockSuccessCallback).toHaveBeenCalledWith(get_ctx);
        });
    });

    describe('add', () => {
        it('should add an index to the object store and call on_success', async () => {
            const mockObjectStore = {
                createIndex: jest.fn()
            };

            const add_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'newIndex',
                index_key_path: 'keyPath',
                index_unique: true,
                on_success: mockSuccessCallback
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
        it('should remove an index from the object store and call on_success', async () => {
            const mockObjectStore = {
                deleteIndex: jest.fn()
            };

            const remove_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'indexToRemove',
                on_success: mockSuccessCallback
            };

            await indexesMethods.remove(remove_ctx);

            expect(mockObjectStore.deleteIndex).toHaveBeenCalledWith('indexToRemove');
            expect(mockSuccessCallback).toHaveBeenCalledWith(remove_ctx);
        });
    });

    describe('getEntries', () => {
        it('should retrieve entries from an index and call on_success for each entry and on_complete at the end', async () => {
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
                on_success: mockSuccessCallback,
                on_complete: mockCompleteCallback,
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
        it('should count entries from an index and call on_success with the count', async () => {
            const mockRequest = {
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'success') {
                        callback();  // Simulate success
                    }
                }),
                result: 10
            };

            const mockObjectStore = {
                index: jest.fn(() => ({
                    count: jest.fn(() => mockRequest)
                }))
            };

            const count_ctx: DashContext = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                index: 'indexName',
                on_success: mockSuccessCallback
            };

            await indexesMethods.countEntries(count_ctx);

            expect(mockObjectStore.index).toHaveBeenCalledWith('indexName');
            expect(mockSuccessCallback).toHaveBeenCalledWith(count_ctx);
            expect(count_ctx.total).toBe(10);
        });
    });
});
