import dash from '../../src/dash'; // Import the dash library
import { IDBDatabase } from 'idb'; // Import IDBDatabase if it's available as a type

describe("close.database", () => {
  const startTime = new Date().getTime();
  const dbName = `database-close-test-${startTime}`;
  
  let error = false;
  let success = false;
  let notify = false;
  let ctx: any;

  beforeEach(async () => {
    await new Promise<void>((resolve, reject) => {
      dash.get.database({ database: dbName })
        .then((context: any) => {
          ctx = context;
          success = true;
          resolve();
        })
        .catch((context: any) => {
          ctx = context;
          error = true;
          resolve(); // Resolve on error to avoid hanging the test
        })
        .finally(() => {
          // Handle notifications, if needed
          notify = true;
        });
    });
  });

  it("should open and then close the database successfully", () => {
    expect(notify).toBe(false);
    expect(error).toBe(false);
    expect(ctx.error).toBeUndefined();
    expect(success).toBe(true);
    expect(ctx.db).not.toBeFalsy();
    expect(ctx.db instanceof IDBDatabase).toBe(false); // This is just a check; adapt as needed
    dash.remove.database(ctx);
  });
});
