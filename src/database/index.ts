import { cloneError, DashContext, exists } from "../utilities";

/**
 * Database management methods.
 * @module databaseMethods
 */
export const databaseMethods = {
    /**
     * Retrieves an entry from the object store.
     * @param {DashContext} getCtx - The context containing the object store and key to fetch.
     * @returns {Promise<DashContext>} A promise that resolves with the context containing the entry, or rejects with an error.
     */
    get: (getCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to get the entry from the object store using the provided key
            const request = getCtx.objectstore?.get(getCtx.key);
            
            // If the request is invalid (e.g., object store doesn't exist), reject with an error
            if (!request) {
                getCtx.error = { message: 'Invalid object store', name: 'DashError' };
                reject(getCtx);
                return;
            }

            // Handle the success case for the request
            request.onsuccess = (event: Event) => {
                const result = (event.target as IDBRequest).result;
                // If no result is found, reject with a missing entry error
                if (!result) {
                    getCtx.error = { message: 'Missing entry', name: 'DashNoEntry' };
                    reject(getCtx);
                } else {
                    // Otherwise, set the entry in the context and resolve
                    getCtx.entry = result;
                    resolve(getCtx);
                }
            };

            // Handle errors that occur during the request
            request.onerror = (event: Event) => {
                const error = (event.target as IDBRequest).error;
                // Clone the error or set a generic error
                getCtx.error = error ? cloneError(error) : { message: 'Unknown error', name: 'DashError' };
                reject(getCtx);
            };
        });
    },

    /**
     * Adds or updates an entry in the object store.
     * @param {DashContext} putCtx - The context containing the object store, data, and optionally the key.
     * @returns {Promise<DashContext>} A promise that resolves with the updated context or rejects with an error.
     */
    put: (putCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Check if a key exists, and either update or insert accordingly
            const request = exists(putCtx.key)
                ? putCtx.objectstore?.put(putCtx.data, putCtx.key)
                : putCtx.objectstore?.put(putCtx.data);

            // If the request is invalid, reject with an error
            if (!request) {
                putCtx.error = { message: 'Invalid object store', name: 'DashError' };
                reject(putCtx);
                return;
            }

            // Handle the success case for the request
            request.onsuccess = (event: Event) => {
                // On success, set the key and entry in the context
                putCtx.key = (event.target as IDBRequest).result;
                putCtx.entry = putCtx.data;
                resolve(putCtx);
            };

            // Handle errors that occur during the request
            request.onerror = (event: Event) => {
                const error = (event.target as IDBRequest).error;
                // Clone the error or set a generic error
                putCtx.error = error ? cloneError(error) : { message: 'Unknown error', name: 'DashError' };
                reject(putCtx);
            };
        });
    },

    /**
     * Removes an entry from the object store.
     * @param {DashContext} removeCtx - The context containing the object store and key to delete.
     * @returns {Promise<DashContext>} A promise that resolves when the entry is deleted or rejects with an error.
     */
    remove: (removeCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to delete the entry using the provided key
            const request = removeCtx.objectstore?.delete(removeCtx.key);

            // If the request is invalid, reject with an error
            if (!request) {
                removeCtx.error = { message: 'Invalid object store', name: 'DashError' };
                reject(removeCtx);
                return;
            }

            // Handle the success case for the request
            request.onsuccess = () => {
                // On success, resolve with the updated context
                resolve(removeCtx);
            };

            // Handle errors that occur during the request
            request.onerror = (event: Event) => {
                const error = (event.target as IDBRequest).error;
                // Clone the error or set a generic error
                removeCtx.error = error ? cloneError(error) : { message: 'Unknown error', name: 'DashError' };
                reject(removeCtx);
            };
        });
    }
};

export default databaseMethods;
