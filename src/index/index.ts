/**
 * Index methods for interacting with IndexedDB.
 * @module index
 */

import { cloneError, DashContext } from "../utilities";

// Index methods
export const indexMethods = {
    /**
     * Retrieves an entry from a specific index in the object store.
     * @param {DashContext} getCtx - The context containing the index and key to retrieve.
     * @returns {Promise<DashContext>} A promise that resolves with the context including the retrieved entry.
     * @private
     */
    get: (getCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to get the entry from the specified index using the key
            const request = getCtx.idx?.get(getCtx.key);

            // Handle success event
            request?.addEventListener('success', () => {
                getCtx.entry = request.result;
                resolve(getCtx);
            });

            // Handle error event
            request?.addEventListener('error', (event) => {
                getCtx.error = cloneError((event as any).target.error);
                reject(getCtx);
            });
        });
    },

    /**
     * Removes an index from the object store.
     * @param {DashContext} removeCtx - The context containing the object store and index key to delete.
     * @returns {Promise<DashContext>} A promise that resolves once the index is removed.
     * @private
     */
    remove: (removeCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // The deleteIndex method does not return a request object, so no success/error handlers are needed
            // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/deleteIndex#return_value
            try {
                removeCtx.objectstore?.deleteIndex(removeCtx.key);
                resolve(removeCtx);
            } catch (error) {
                removeCtx.error = cloneError(error as Error);
                reject(removeCtx);
            }
        });
    },

    /**
     * Retrieves all index names from the object store.
     * @param {DashContext} ctx - The context containing the object store.
     * @returns {Promise<DashContext>} A promise that resolves with the context including the list of index names.
     * @private
     */
    getIndexes: (ctx: DashContext): Promise<DashContext> => {
        return new Promise((resolve) => {
            // Get all index names from the object store and store them in the context
            const indexes = ctx.objectstore?.indexNames;
            ctx.indexes = Array.from(indexes || []);
            resolve(ctx);
        });
    }
};

export default indexMethods;
