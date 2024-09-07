
import { entryMethods } from "../../src/entry";

// Mock data and context for tests
const mockObjectStore = {
    add: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    index: jest.fn(),
    count: jest.fn(),
};

describe('entryMethods', () => {

    describe('add', () => {
        const add_ctx = {
            objectstore: mockObjectStore as unknown as IDBObjectStore,
            data: {},
            key: 'testKey',
        };

        it('should add an entry and resolve with the updated context', async () => {
            mockObjectStore.add.mockReturnValueOnce({
                addEventListener: (event: string, callback: () => void) => {
                    if (event === 'success') {
                        callback();
                    }
                },
                result: 'newKey'
            });
            const result = await entryMethods.add({ ...add_ctx, objectstore: mockObjectStore as unknown as IDBObjectStore });
            expect((result as { key: string }).key).toBe('newKey');
        });

        it('should reject with an error if the request fails', async () => {
            return await expect(entryMethods.add(add_ctx)).rejects.toEqual(expect.objectContaining({
                error: expect.objectContaining({
                    message: "Request object is null",
                    name: "DashRequestError"
                })
            }));
        });
    });

    describe('get', () => {
        const get_ctx = {
            objectstore: mockObjectStore as unknown as IDBObjectStore,
            key: 'testKey',
            index: null,
        };

        it('should get an entry and resolve with the context', async () => {
            mockObjectStore.get.mockReturnValueOnce({
                addEventListener: (event: string, callback: () => void) => {
                    if (event === 'success') {
                        callback();
                    }
                },
                result: { entryData: 'test' }
            });
            const result = await entryMethods.get(get_ctx) as { entry: { entryData: string } };
            expect(result.entry).toEqual({ entryData: 'test' });
        });

        it('should reject with an error if the request fails', async () => {
            await expect(entryMethods.get(get_ctx)).rejects.toEqual(expect.objectContaining({
                error: expect.objectContaining({
                    message: "Request object is null",
                    name: "DashRequestError"
                })
            }));
        });
    });

    describe('put', () => {
        const put_ctx = {
            objectstore: mockObjectStore as unknown as IDBObjectStore,
            data: {},
            key: 'testKey',
        };

        it('should put an entry and resolve with the updated context', async () => {
            mockObjectStore.put.mockReturnValueOnce({
                addEventListener: (event: string, callback: () => void) => {
                    if (event === 'success') {
                        callback();
                    }
                },
            });
            const result = await entryMethods.put(put_ctx) as { entry: any };
            expect(result.entry).toBe(put_ctx.data);
        });

        it('should reject with an error if the request fails', async () => {
            await expect(entryMethods.put(put_ctx)).rejects.toEqual(expect.objectContaining({
                error: expect.objectContaining({
                    message: "Request object is null",
                    name: "DashRequestError"
                })
            }));
        });
    });

    describe('remove', () => {
        const remove_ctx = {
            objectstore: mockObjectStore as unknown as IDBObjectStore,
            key: 'testKey',
        };

        it('should remove an entry and resolve with the context', async () => {
            mockObjectStore.delete.mockReturnValueOnce({
                addEventListener: (event: string, callback: () => void) => {
                    if (event === 'success') {
                        callback();
                    }
                },
            });
            const result = await entryMethods.remove(remove_ctx) as { key: string };
            expect(result.key).toBe('testKey');
        });

        it('should reject with an error if the request fails', async () => {
            await expect(entryMethods.remove(remove_ctx)).rejects.toEqual(expect.objectContaining({
                error: expect.objectContaining({
                    message: "Request object is null",
                    name: "DashRequestError"
                })
            }));
        });
    });

    describe('count', () => {
        const count_ctx = {
            objectstore: mockObjectStore as unknown as IDBObjectStore,
        };

        it('should count entries and resolve with the context', async () => {
            mockObjectStore.count.mockReturnValueOnce({
                addEventListener: (event: string, callback: () => void) => {
                    if (event === 'success') {
                        callback();
                    }
                },
                result: 42,
            });
            const result = await entryMethods.count(count_ctx) as { amount: number };
            expect(result.amount).toBe(42);
        });

        it('should reject with an error if the request fails', async () => {
            await expect(entryMethods.count(count_ctx)).rejects.toEqual(expect.objectContaining({
                error: expect.objectContaining({
                    message: "Request object is null",
                    name: "DashRequestError"
                })
            }));
        });
    });

    describe('entryMethods - additional tests', () => {
        describe('add', () => {
            const add_ctx = {
                objectstore: { add: jest.fn(() => null) } as any,
                data: { name: 'test' },
                key: 'testKey',
            };
            
            it('should reject with an error if request fails', async () => {
                add_ctx.objectstore = { add: jest.fn(() => null) };
                await expect(entryMethods.add(add_ctx)).rejects.toEqual(expect.objectContaining({
                    error: expect.objectContaining({
                        message: "Request object is null",
                        name: "DashRequestError"
                    })
                }));
            });
        });
    
        describe('get', () => {
            const get_ctx1 = {
                objectstore: {
                    index: jest.fn(() => null),
                    get: jest.fn(() => null)
                } as any,
                key: 'testKey',
                index: null,
            };
            
            const get_ctx2 = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                key: 'testKey',
                index: null,
            };
            
            it('should reject with an error if the objectstore is null', async () => {
                return await expect(entryMethods.get(get_ctx1)).rejects.toEqual(expect.objectContaining({
                    error: expect.objectContaining({
                        message: "Request object is null",
                        name: "DashRequestError"
                    })
                }));
            });
    
            it('should reject with an error if the index is invalid', async () => {
                get_ctx1.objectstore = {
                    index: jest.fn(() => null),
                    get: jest.fn(() => null)
                };
                (get_ctx1 as any).index = 'invalidIndex';  // Casting to any if necessary
                await expect(entryMethods.get(get_ctx1)).rejects.toEqual(expect.objectContaining({
                    error: expect.objectContaining({
                        message: "Invalid index or get method",
                        name: "DashInvalidIndex"
                    })
                }));
            });
        });
    
        describe('remove', () => {
            const remove_ctx = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
                key: 'testKey',
            };
    
            it('should reject with an error if the request is null', async () => {
                return await expect(entryMethods.remove(remove_ctx)).rejects.toEqual(expect.objectContaining({
                    error: expect.objectContaining({
                        message: "Request object is null",
                        name: "DashRequestError"
                    })
                }));
            });
        });
    
        describe('count', () => {
            const count_ctx = {
                objectstore: mockObjectStore as unknown as IDBObjectStore,
            };
    
            it('should reject with an error if the objectstore is null', async () => {
                return await expect(entryMethods.count(count_ctx)).rejects.toEqual(expect.objectContaining({
                    error: expect.objectContaining({
                        message: "Request object is null",
                        name: "DashRequestError"
                    })
                }));
            });
        });
    });

});
