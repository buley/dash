/**
 * Stores methods for managing object stores within an IndexedDB database.
 * @module stores
 */

import { cloneError, DashContext, exists, safeApply } from "../utilities";

// Store methods
export const storesMethods = {
    /**
     * Retrieves all object stores from the current database.
     * @param {DashContext} getCtx - The context object containing the database reference.
     * @returns {Promise<DashContext>} A promise that resolves with the context, including the list of stores.
     * @private
     */
    get: function (getCtx: DashContext) {
        // Retrieves all object store names from the current database
        getCtx.stores = getCtx.db?.objectStoreNames;
        safeApply(getCtx.onSuccess, [getCtx]);
    },

    /**
     * Adds a new object store to the current database. This triggers a database version change.
     * @param {DashContext} addCtx - The context object containing the database and store configuration.
     * @returns {Promise<DashContext>} A promise that resolves once the store is added.
     * @private
     */
    add: function (addCtx: DashContext) {
        // Ensure the database reference is available
        addCtx.db = addCtx.request?.result;
        if (!addCtx.db) {
            throw new Error("Database is undefined");
        }

        // Create a new object store in the database
        const store = addCtx.db.createObjectStore(addCtx.store, {
            keyPath: addCtx.storeKeyPath || null,
            autoIncrement: !!addCtx.autoIncrement
        });

        // Create indexes if provided
        if (addCtx.indexes) {
            addCtx.indexes.forEach((idx: any) => {
                store.createIndex(idx.name, idx.keyPath, {
                    unique: !!idx.unique,
                    multiEntry: !!idx.multiEntry
                });
            });
        }

        safeApply(addCtx.onSuccess, [addCtx]);
    },

    /**
     * Removes an object store from the current database. This triggers a version change.
     * @param {DashContext} removeCtx - The context object containing the store name and database reference.
     * @returns {Promise<DashContext>} A promise that resolves once the store is removed.
     * @private
     */
    remove: function (removeCtx: DashContext) {
        // Remove the specified object store from the database
        removeCtx.db?.deleteObjectStore(removeCtx.store);
        safeApply(removeCtx.onSuccess, [removeCtx]);
    },

    /**
     * Clears all entries in all object stores in the current database.
     * @param {DashContext} clearCtx - The context object containing the database reference.
     * @returns {Promise<DashContext>} A promise that resolves once all stores are cleared.
     * @private
     */
    clearAll: function (clearCtx: DashContext) {
        // Get all object store names and open a readwrite transaction
        const storeNames = Array.from(clearCtx.db?.objectStoreNames || []);
        const transaction = clearCtx.db?.transaction(storeNames as any, "readwrite");

        // Clear each store in the transaction
        storeNames.forEach((storeName: string) => {
            const objectStore = transaction?.objectStore(storeName);
            objectStore?.clear();
        });

        // Handle transaction success
        transaction?.addEventListener('complete', () => {
            safeApply(clearCtx.onSuccess, [clearCtx]);
        });

        // Handle transaction error
        transaction?.addEventListener('error', (event) => {
            clearCtx.error = cloneError((event as any).target.error);
            safeApply(clearCtx.onError, [clearCtx]);
        });
    }
};

export default storesMethods;
