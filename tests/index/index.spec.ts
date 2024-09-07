import { indexMethods } from '../../src/index/index';
import { DashContext } from '../../src/utilities';

describe('indexMethods', () => {
  describe('get', () => {
    it('should get an index and resolve with the entry', async () => {
      const mockEntry = { id: 1, name: 'Test Entry' };
      const mockRequest = {
        result: mockEntry,
        addEventListener: jest.fn((event, callback) => {
          if (event === 'success') {
            callback();
          }
        }),
      };
      const mockIndex = {
        get: jest.fn(() => mockRequest),
      };
      const get_ctx: DashContext = {
        idx: mockIndex as unknown as IDBIndex,
        key: 'testKey',
      };

      const result = await indexMethods.get(get_ctx);

      expect(mockIndex.get).toHaveBeenCalledWith('testKey');
      expect((result as any).entry).toBe(mockEntry);
    });

    it('should reject with an error if the request fails', async () => {
      const mockError = new Error('Test error');
      const mockRequest = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'error') {
            callback({ target: { error: mockError } });
          }
        }),
      };
      const mockIndex = {
        get: jest.fn(() => mockRequest),
      };
      const get_ctx: DashContext = {
        idx: mockIndex as unknown as IDBIndex,
        key: 'testKey',
      };

      await expect(indexMethods.get(get_ctx)).rejects.toEqual(expect.objectContaining({
        error: expect.any(Error),
      }));
    });
  });

  describe('remove', () => {
    it('should remove an index and resolve', async () => {
      const mockObjectStore = {
        deleteIndex: jest.fn(),
      };
      const remove_ctx: DashContext = {
        objectstore: mockObjectStore as unknown as IDBObjectStore,
        key: 'testIndex',
      };

      await indexMethods.remove(remove_ctx);

      expect(mockObjectStore.deleteIndex).toHaveBeenCalledWith('testIndex');
    });
  });

  describe('getIndexes', () => {
    it('should get all indexes and resolve with an array', async () => {
      const mockIndexNames = ['index1', 'index2', 'index3'];
      const mockObjectStore = {
        indexNames: mockIndexNames,
      };
      const ctx: DashContext = {
        objectstore: mockObjectStore as unknown as IDBObjectStore,
      };

      const result = await indexMethods.getIndexes(ctx);
      
      expect((result as { indexes: string[] }).indexes).toEqual(mockIndexNames);
    });

    it('should resolve with an empty array if there are no indexes', async () => {
      const ctx: DashContext = {
        objectstore: {} as IDBObjectStore,
      };

      const result = await indexMethods.getIndexes(ctx);
      
      expect((result as { indexes: string[] }).indexes).toEqual([]);
    });
  });
});