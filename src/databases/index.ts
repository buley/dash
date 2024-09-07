/**
 * Databases management module.
 * @module databases
 */

import { cloneError, DashContext, safeApply } from "../utilities";

// Database methods
export const databasesMethods = {
  /**
   * Retrieves all databases.
   * @param {DashContext} getCtx - The context object containing the callback functions.
   * @returns {Promise<DashContext>} A promise that resolves with the context including the databases list.
   */
  get: function (getCtx: DashContext): Promise<DashContext> {
    return new Promise((resolve, reject) => {
      try {
        // Retrieve the list of databases
        getCtx.databases = indexedDB.databases();
        safeApply(getCtx.onSuccess, [getCtx]);
        resolve(getCtx);
      } catch (error) {
        // Capture any errors and reject
        getCtx.error = error;
        safeApply(getCtx.onError, [getCtx]);
        reject(getCtx);
      }
    });
  },

  /**
   * Opens a specific database.
   * @param {DashContext} openCtx - The context object containing the database name and version.
   * @returns {Promise<DashContext>} A promise that resolves with the opened database in the context.
   */
  open: function (openCtx: DashContext): Promise<DashContext> {
    return new Promise((resolve, reject) => {
      // Open the database with the provided name and version
      const request = indexedDB.open(openCtx.database, openCtx.version);

      // Handle successful database open
      request.addEventListener('success', (event) => {
        openCtx.db = (event.target as IDBOpenDBRequest).result;
        resolve(openCtx);
      });

      // Handle the case where the database version changes or the store is created
      request.addEventListener('upgradeneeded', (event) => {
        openCtx.db = (event.target as IDBOpenDBRequest).result;
        if (openCtx.onUpgradeNeeded) {
          safeApply(openCtx.onUpgradeNeeded, [openCtx]);
        }
        resolve(openCtx);
      });

      // Handle errors during the opening process
      request.addEventListener('error', (event) => {
        openCtx.error = cloneError((event as any).target.error);
        reject(openCtx);
      });

      // Handle blocked event when another connection prevents opening the database
      request.addEventListener('blocked', (event) => {
        if (openCtx.onBlocked) {
          safeApply(openCtx.onBlocked, [openCtx]);
        }
        reject(openCtx);
      });
    });
  },

  /**
   * Deletes a database by name.
   * @param {DashContext} deleteCtx - The context object containing the database name to delete.
   * @returns {Promise<DashContext>} A promise that resolves once the database is deleted.
   */
  delete: function (deleteCtx: DashContext): Promise<DashContext> {
    return new Promise((resolve, reject) => {
      // Delete the database
      const request = indexedDB.deleteDatabase(deleteCtx.database);

      // Handle successful deletion
      request.addEventListener('success', () => {
        resolve(deleteCtx);
      });

      // Handle errors during deletion
      request.addEventListener('error', (event) => {
        deleteCtx.error = cloneError((event as any).target.error);
        reject(deleteCtx);
      });

      // Handle blocked event if another connection prevents deletion
      request.addEventListener('blocked', (event) => {
        if (deleteCtx.onBlocked) {
          safeApply(deleteCtx.onBlocked, [deleteCtx]);
        }
        reject(deleteCtx);
      });
    });
  },

  /**
   * Closes an open database.
   * @param {DashContext} closeCtx - The context object containing the database to close.
   * @returns {Promise<DashContext>} A promise that resolves once the database is closed.
   */
  close: function (closeCtx: DashContext): Promise<DashContext> {
    return new Promise((resolve) => {
      if (closeCtx.db) {
        // Close the open database connection
        closeCtx.db.close();
      }
      resolve(closeCtx);
    });
  },

  /**
   * Lists all databases in the current environment.
   * @returns {Promise<IDBDatabaseInfo[]>} A promise that resolves with an array of database information objects.
   */
  listAll: function (): Promise<IDBDatabaseInfo[]> {
    return new Promise((resolve, reject) => {
      // Check if the `databases` method is supported in the current browser
      if ('databases' in indexedDB && typeof (indexedDB as any).databases === 'function') {
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
