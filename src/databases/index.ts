/**
 * Databases module.
 * @module databases
 */

import { cloneError, DashContext, safeApply } from "../utilities";

// Database methods
export const databasesMethods = {
    /**
     * Gets all databases.
     * @param get_ctx The context object.
     * @returns Promise<DashContext>
     */
    get: function (get_ctx: DashContext): Promise<DashContext> {
      return new Promise((resolve, reject) => {
        get_ctx.databases = indexedDB.databases();
        safeApply(get_ctx.on_success, [get_ctx]);
        resolve(get_ctx);
      });
    },
    /**
     * Opens a database.
     * @param open_ctx The context object.
     * @returns Promise<DashContext>
     */
    open: function (open_ctx: DashContext): Promise<DashContext> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(open_ctx.database, open_ctx.version);
  
        // Handle success
        request.addEventListener('success', (event) => {
          open_ctx.db = (event.target as IDBOpenDBRequest).result;
          resolve(open_ctx);
        });
  
        // Handle upgradeneeded event (used for setting up new object stores or changing version)
        request.addEventListener('upgradeneeded', (event) => {
          open_ctx.db = (event.target as IDBOpenDBRequest).result;
          if (open_ctx.on_upgrade_needed) {
            safeApply(open_ctx.on_upgrade_needed, [open_ctx]);
          }
          resolve(open_ctx);
        });
  
        // Handle errors
        request.addEventListener('error', (event) => {
          open_ctx.error = cloneError((event as any).target.error);
          reject(open_ctx);
        });
  
        // Handle blocked (when another connection keeps the database from opening)
        request.addEventListener('blocked', (event) => {
          if (open_ctx.on_blocked) {
            safeApply(open_ctx.on_blocked, [open_ctx]);
          }
          reject(open_ctx);
        });
      });
    },
    /**
     * Deletes a database.
     * @param delete_ctx The context object.
     * @returns Promise<DashContext>
     */
    delete: function (delete_ctx: DashContext): Promise<DashContext> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(delete_ctx.database);
  
        request.addEventListener('success', () => {
          resolve(delete_ctx);
        });
  
        request.addEventListener('error', (event) => {
          delete_ctx.error = cloneError((event as any).target.error);
          reject(delete_ctx);
        });
  
        request.addEventListener('blocked', (event) => {
          if (delete_ctx.on_blocked) {
            safeApply(delete_ctx.on_blocked, [delete_ctx]);
          }
          reject(delete_ctx);
        });
      });
    },
    /**
     * Closes a database.
     * @param close_ctx The context object.
     * @returns Promise<DashContext>
     */
    close: function (close_ctx: DashContext): Promise<DashContext> {
      return new Promise((resolve) => {
        if (close_ctx.db) {
          close_ctx.db.close();
        }
        resolve(close_ctx);
      });
    },
    /**
     * Lists all databases.
     * @returns Promise<IDBDatabaseInfo[]>
     */
    listAll: function (): Promise<IDBDatabaseInfo[]> {
      // This method lists all databases in environments that support `databases()` method (IndexedDB API)
      return new Promise((resolve, reject) => {
        if ('databases' in indexedDB) {
          (indexedDB as any).databases().then((databases: IDBDatabaseInfo[]) => {
            resolve(databases);
          }).catch((error: any) => {
            reject(error);
          });
        } else {
          reject(new Error("The `databases` method is not supported in this browser."));
        }
      });
    }
  };

  export default databasesMethods;