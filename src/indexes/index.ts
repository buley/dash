/**
 * Indexes methods for managing and interacting with indexes in an IndexedDB object store.
 * @module indexes
 */

import { cloneError, DashContext, safeApply } from "../utilities";

// Indexes methods
export const indexesMethods = {
    /**
     * Retrieves all index names from a specific object store.
     * @param {DashContext} getCtx - The context object containing the object store.
     * @returns {Promise<DashContext>} A promise that resolves with the context including the index names.
     */
    get: function (getCtx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                // Retrieve the index names from the object store
                getCtx.indexes = getCtx.objectstore?.indexNames;
                if (getCtx.onSuccess) {
                    safeApply(getCtx.onSuccess, [getCtx]);
                }
                resolve(getCtx);
            } catch (error) {
                // Handle errors
                getCtx.error = cloneError(error as Error);
                if (getCtx.onError) {
                    safeApply(getCtx.onError, [getCtx]);
                }
                reject(getCtx);
            }
        });
    },

    /**
     * Adds a new index to an object store.
     * @param {DashContext} addCtx - The context object containing the object store, index name, key path, and index options.
     * @returns {Promise<DashContext>} A promise that resolves with the context once the index is added.
     */
    add: function (addCtx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                // Create a new index in the object store with the provided options
                addCtx.objectstore?.createIndex(addCtx.index, addCtx.indexKeyPath, {
                    unique: !!addCtx.indexUnique,
                    multiEntry: !!addCtx.indexMultiEntry
                });
                if (addCtx.onSuccess) {
                    safeApply(addCtx.onSuccess, [addCtx]);
                }
                resolve(addCtx);
            } catch (error) {
                // Handle errors
                addCtx.error = cloneError(error as Error);
                if (addCtx.onError) {
                    safeApply(addCtx.onError, [addCtx]);
                }
                reject(addCtx);
            }
        });
    },

    /**
     * Removes an index from an object store.
     * @param {DashContext} removeCtx - The context object containing the object store and index name.
     * @returns {Promise<DashContext>} A promise that resolves once the index is removed.
     */
    remove: function (removeCtx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                // Remove the index from the object store
                removeCtx.objectstore?.deleteIndex(removeCtx.index);
                if (removeCtx.onSuccess) {
                    safeApply(removeCtx.onSuccess, [removeCtx]);
                }
                resolve(removeCtx);
            } catch (error) {
                // Handle errors
                removeCtx.error = cloneError(error as Error);
                if (removeCtx.onError) {
                    safeApply(removeCtx.onError, [removeCtx]);
                }
                reject(removeCtx);
            }
        });
    },

    /**
     * Retrieves all entries from a specific index in an object store.
     * @param {DashContext} getCtx - The context object containing the object store and index name.
     * @returns {Promise<DashContext>} A promise that resolves once all entries are retrieved.
     */
    getEntries: function (getCtx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            // Open a cursor to retrieve all entries from the specified index
            const request = getCtx.objectstore?.index(getCtx.index)?.openCursor();

            if (!request) {
                getCtx.error = new Error("Failed to open cursor");
                if (getCtx.onError) {
                    safeApply(getCtx.onError, [getCtx]);
                }
                reject(getCtx);
                return;
            }

            // Handle the success event of the cursor
            request.onsuccess = function (event) {
                const cursor = request.result;
                if (cursor) {
                    // If there are more entries, apply the onSuccess handler and continue
                    if (getCtx.onSuccess) {
                        safeApply(getCtx.onSuccess, [cursor.value]);
                    }
                    cursor.continue();
                } else {
                    // Once all entries are retrieved, apply the onComplete handler
                    if (getCtx.onComplete) {
                        safeApply(getCtx.onComplete, [getCtx]);
                    }
                    resolve(getCtx);
                }
            };

            // Handle the error event of the cursor
            request.onerror = function () {
                getCtx.error = cloneError(request.error!);
                if (getCtx.onError) {
                    safeApply(getCtx.onError, [getCtx]);
                }
                reject(getCtx);
            };
        });
    },

    /**
     * Counts the number of entries in a specific index.
     * @param {DashContext} countCtx - The context object containing the object store and index name.
     * @returns {Promise<DashContext>} A promise that resolves with the context including the count of entries.
     */
    countEntries: function (countCtx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            // Count the number of entries in the specified index
            const request = countCtx.objectstore?.index(countCtx.index)?.count();

            // Handle the success event for counting entries
            request?.addEventListener('success', function () {
                countCtx.total = request.result;
                if (countCtx.onSuccess) {
                    safeApply(countCtx.onSuccess, [countCtx]);
                }
                resolve(countCtx);
            });

            // Handle the error event for counting entries
            request?.addEventListener('error', function (event: any) {
                countCtx.error = cloneError((event as any).target.error);
                if (countCtx.onError) {
                    safeApply(countCtx.onError, [countCtx]);
                }
                reject(countCtx);
            });
        });
    }
};

export default indexesMethods;
