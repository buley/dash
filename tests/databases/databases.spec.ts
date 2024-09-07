import { databasesMethods } from '../../src/databases';
import { DashContext } from '../../src/utilities';

// Mock indexedDB globally
const mockIndexedDB = {
  databases: jest.fn(),
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
(global as any).indexedDB = mockIndexedDB;

describe('databasesMethods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('open', () => {
    it('should open a database successfully', async () => {
      const mockDB = {};
      const mockRequest = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'success') {
            callback({ target: { result: mockDB } });
          }
        }),
      };
      mockIndexedDB.open.mockReturnValue(mockRequest);

      const open_ctx: DashContext = {
        database: 'testDB',
        version: 1,
      };

      const result = await databasesMethods.open(open_ctx);
      expect(result.db).toBe(mockDB);
      expect(mockIndexedDB.open).toHaveBeenCalledWith('testDB', 1);
    });

    it('should handle upgradeneeded event', async () => {
      const mockDB = {};
      const mockRequest = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'upgradeneeded') {
            callback({ target: { result: mockDB } });
          }
        }),
      };
      mockIndexedDB.open.mockReturnValue(mockRequest);

      const open_ctx: DashContext = {
        database: 'testDB',
        version: 2,
        onUpgradeNeeded: jest.fn(),
      };

      const result = await databasesMethods.open(open_ctx);
      expect(result.db).toBe(mockDB);
      expect(open_ctx.onUpgradeNeeded).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = new Error('Open failed');
      const mockRequest = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'error') {
            callback({ target: { error: mockError } });
          }
        }),
      };
      mockIndexedDB.open.mockReturnValue(mockRequest);

      const open_ctx: DashContext = {
        database: 'testDB',
        version: 1,
      };

      await expect(databasesMethods.open(open_ctx)).rejects.toMatchObject({
        error: mockError,
      });
    });
  });

  describe('get', () => {
    it('should get all databases successfully', async () => {
      const mockDatabases = [{ name: 'db1' }, { name: 'db2' }];
      mockIndexedDB.databases.mockReturnValue(mockDatabases);

      const get_ctx: DashContext = {
        databases: [],
        onSuccess: jest.fn(),
      };

      const result = await databasesMethods.get(get_ctx);
      expect(result.databases).toEqual(mockDatabases);
      expect(get_ctx.onSuccess).toHaveBeenCalledWith({
        databases: mockDatabases,
        onSuccess: get_ctx.onSuccess
      });
    });

    it('should handle errors when getting databases', async () => {
      const mockError = new Error('Get failed');
      mockIndexedDB.databases.mockImplementation(() => {
        throw mockError;
      });

      const get_ctx: DashContext = {
        databases: [],
        onError: jest.fn(),
      };

      try {
        await databasesMethods.get(get_ctx);
      } catch (error) {
        expect(error).toMatchObject({
          error: mockError,
        });
      }

      expect(get_ctx.onError).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a database successfully', async () => {
      const mockRequest = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'success') {
            callback();
          }
        }),
      };
      mockIndexedDB.deleteDatabase.mockReturnValue(mockRequest);

      const delete_ctx: DashContext = {
        database: 'testDB',
      };

      const result = await databasesMethods.delete(delete_ctx);
      expect(result).toBe(delete_ctx);
      expect(mockIndexedDB.deleteDatabase).toHaveBeenCalledWith('testDB');
    });

    it('should handle errors during deletion', async () => {
      const mockError = new Error('Delete failed');
      const mockRequest = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'error') {
            callback({ target: { error: mockError } });
          }
        }),
      };
      mockIndexedDB.deleteDatabase.mockReturnValue(mockRequest);

      const delete_ctx: DashContext = {
        database: 'testDB',
      };

      await expect(databasesMethods.delete(delete_ctx)).rejects.toMatchObject({
        error: mockError,
      });
    });
  });

  describe('close', () => {
    it('should close a database', async () => {
      const mockDB = {
        close: jest.fn(),
      } as unknown as IDBDatabase;
      const close_ctx: DashContext = {
        db: mockDB,
      };

      const result = await databasesMethods.close(close_ctx);
      expect(result).toBe(close_ctx);
      expect(mockDB.close).toHaveBeenCalled();
    });
  });

  describe('listAll', () => {
    it('should list all databases when supported', async () => {
      const mockDatabases = [{ name: 'db1' }, { name: 'db2' }];
      mockIndexedDB.databases.mockResolvedValue(mockDatabases);

      const result = await databasesMethods.listAll();
      expect(result).toEqual(mockDatabases);
    });

    it('should handle errors when listing databases', async () => {
      const mockError = new Error('Listing failed');
      mockIndexedDB.databases.mockRejectedValue(mockError);

      await expect(databasesMethods.listAll()).rejects.toThrow('Listing failed');
    });

    it('should reject when databases method is not supported', async () => {
      const originalDatabases = mockIndexedDB.databases;
      mockIndexedDB.databases = undefined as any;

      await expect(databasesMethods.listAll()).rejects.toThrow(
        "The `databases` method is not supported in this browser."
      );

      mockIndexedDB.databases = originalDatabases;
    });
  });
});