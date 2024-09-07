/**
 * Store methods for interacting with IndexedDB object stores.
 * @module store
 */

import { cloneError, DashContext, exists } from "../utilities";

// Store methods
export const storeMethods = {
    /**
     * Clears all entries from the object store.
     * @param {DashContext} clearCtx - The context object containing the object store.
     * @returns {Promise<DashContext>} A promise that resolves when the store is cleared.
     */
    clear: (clearCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to clear the object store
            const request: IDBRequest<any> | undefined = clearCtx.objectstore?.clear();

            // Handle success event
            request?.addEventListener('success', () => {
                if (clearCtx.onSuccess) {
                    clearCtx.onSuccess(clearCtx); // Call the success callback if provided
                }
                resolve(clearCtx);
            });

            // Handle error event
            request?.addEventListener('error', (event) => {
                clearCtx.error = cloneError((event as any).target.error);
                if (clearCtx.onError) {
                    clearCtx.onError(clearCtx); // Call the error callback if provided
                }
                reject(clearCtx);
            });
        });
    },

    /**
     * Removes an entry from the object store.
     * @param {DashContext} removeCtx - The context object containing the object store and key to delete.
     * @returns {Promise<DashContext>} A promise that resolves when the entry is removed.
     */
    remove: (removeCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to remove the entry by key from the object store
            const request: IDBRequest<any> | undefined = removeCtx.objectstore?.delete(removeCtx.key);

            // Handle success event
            request?.addEventListener('success', () => {
                if (removeCtx.onSuccess) {
                    removeCtx.onSuccess(removeCtx); // Call the success callback if provided
                }
                resolve(removeCtx);
            });

            // Handle error event
            request?.addEventListener('error', (event) => {
                removeCtx.error = cloneError((event as any).target.error);
                if (removeCtx.onError) {
                    removeCtx.onError(removeCtx); // Call the error callback if provided
                }
                reject(removeCtx);
            });
        });
    },

    /**
     * Retrieves an entry from the object store.
     * @param {DashContext} getCtx - The context object containing the object store, key, and optionally an index.
     * @returns {Promise<DashContext>} A promise that resolves with the retrieved entry.
     */
    get: (getCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Determine whether to retrieve the entry from an index or directly from the object store
            const request: IDBRequest<any> | undefined = exists(getCtx.index)
                ? getCtx.objectstore?.index(getCtx.index)?.get(getCtx.key) as IDBRequest<any>
                : getCtx.objectstore?.get(getCtx.key) as IDBRequest<any>;

            // Handle success event
            request?.addEventListener('success', () => {
                getCtx.entry = request.result;
                if (!getCtx.entry) {
                    getCtx.error = { message: 'missing', name: 'DashNoEntry' };
                    if (getCtx.onError) {
                        getCtx.onError(getCtx); // Call the error callback if provided
                    }
                    reject(getCtx);
                } else {
                    if (getCtx.onSuccess) {
                        getCtx.onSuccess(getCtx); // Call the success callback if provided
                    }
                    resolve(getCtx);
                }
            });

            // Handle error event
            request?.addEventListener('error', (event) => {
                getCtx.error = cloneError((event as any).target.error);
                if (getCtx.onError) {
                    getCtx.onError(getCtx); // Call the error callback if provided
                }
                reject(getCtx);
            });
        });
    }
};

export default storeMethods;
