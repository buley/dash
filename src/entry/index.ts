/**
 * Entry methods
 * @module entry
 */

import { cloneError, DashContext } from "../utilities";

// Entry methods
export const entryMethods = {
    /**
     * Adds a new entry to the object store.
     * @param {DashContext} addCtx - The context object containing the object store, data, and key.
     * @returns {Promise<DashContext>} A promise that resolves with the context, including the added entry and key.
     */
    add: (addCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to add the data to the object store
            const request = addCtx.objectstore?.add(addCtx.data, addCtx.key);

            // If request is null, reject the promise with an error
            if (!request) {
                addCtx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(addCtx);
            }

            // Handle success event
            request.addEventListener('success', () => {
                addCtx.key = request.result;
                addCtx.entry = addCtx.data;
                resolve(addCtx);
            });

            // Handle error event
            request.addEventListener('error', (event) => {
                addCtx.error = cloneError((event as any).target.error);
                reject(addCtx);
            });
        });
    },

    /**
     * Retrieves an entry from the object store.
     * @param {DashContext} getCtx - The context object containing the object store, key, and index (optional).
     * @returns {Promise<DashContext>} A promise that resolves with the context, including the retrieved entry.
     */
    get: (getCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            let request;

            // If an index is provided, use it to retrieve the entry
            if (getCtx.index && getCtx.objectstore && typeof getCtx.objectstore.index === 'function') {
                const index = getCtx.objectstore.index(getCtx.index);
                if (index && typeof index.get === 'function') {
                    request = index.get(getCtx.key);
                } else {
                    getCtx.error = { message: 'Invalid index or get method', name: 'DashInvalidIndex' };
                    return reject(getCtx);
                }
            } else if (getCtx.objectstore && typeof getCtx.objectstore.get === 'function') {
                // Otherwise, use the object store directly
                request = getCtx.objectstore.get(getCtx.key);
            } else {
                getCtx.error = { message: 'Invalid object store or get method', name: 'DashInvalidObjectStore' };
                return reject(getCtx);
            }

            // If request is null, reject the promise with an error
            if (!request) {
                getCtx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(getCtx);
            }

            // Handle success event
            request.addEventListener('success', () => {
                getCtx.entry = request.result;
                resolve(getCtx);
            });

            // Handle error event
            request.addEventListener('error', (event) => {
                getCtx.error = cloneError((event as any).target.error);
                reject(getCtx);
            });
        });
    },

    /**
     * Updates an entry in the object store.
     * @param {DashContext} putCtx - The context object containing the object store, data, and key.
     * @returns {Promise<DashContext>} A promise that resolves with the context, including the updated entry.
     */
    put: (putCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to update the data in the object store
            const request = putCtx.objectstore?.put(putCtx.data, putCtx.key);

            // If request is null, reject the promise with an error
            if (!request) {
                putCtx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(putCtx);
            }

            // Handle success event
            request.addEventListener('success', () => {
                putCtx.entry = putCtx.data;
                resolve(putCtx);
            });

            // Handle error event
            request.addEventListener('error', (event) => {
                putCtx.error = cloneError((event as any).target.error);
                reject(putCtx);
            });
        });
    },

    /**
     * Removes an entry from the object store.
     * @param {DashContext} removeCtx - The context object containing the object store and key to delete.
     * @returns {Promise<DashContext>} A promise that resolves with the context after the entry is deleted.
     */
    remove: (removeCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to delete the entry from the object store
            const request = removeCtx.objectstore?.delete(removeCtx.key);

            // If request is null, reject the promise with an error
            if (!request) {
                removeCtx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(removeCtx);
            }

            // Handle success event
            request.addEventListener('success', () => {
                resolve(removeCtx);
            });

            // Handle error event
            request.addEventListener('error', (event) => {
                removeCtx.error = cloneError((event as any).target.error);
                reject(removeCtx);
            });
        });
    },

    /**
     * Updates an entry in the object store (alias for put).
     * @param {DashContext} updateCtx - The context object containing the object store, data, and key.
     * @returns {Promise<DashContext>} A promise that resolves with the context, including the updated entry.
     */
    update: (updateCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to update the data in the object store (alias for put)
            const request = updateCtx.objectstore?.put(updateCtx.data, updateCtx.key);

            // If request is null, reject the promise with an error
            if (!request) {
                updateCtx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(updateCtx);
            }

            // Handle success event
            request.addEventListener('success', () => {
                updateCtx.entry = updateCtx.data;
                resolve(updateCtx);
            });

            // Handle error event
            request.addEventListener('error', (event) => {
                updateCtx.error = cloneError((event as any).target.error);
                reject(updateCtx);
            });
        });
    },

    /**
     * Counts the number of entries in the object store.
     * @param {DashContext} countCtx - The context object containing the object store and range (optional).
     * @returns {Promise<DashContext>} A promise that resolves with the context, including the count of entries.
     */
    count: (countCtx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            // Attempt to count entries in the object store
            const request = countCtx.objectstore?.count(countCtx.range);

            // If request is null, reject the promise with an error
            if (!request) {
                countCtx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(countCtx);
            }

            // Handle success event
            request.addEventListener('success', () => {
                countCtx.amount = request.result;
                resolve(countCtx);
            });

            // Handle error event
            request.addEventListener('error', (event) => {
                countCtx.error = cloneError((event as any).target.error);
                reject(countCtx);
            });
        });
    }
};

export default entryMethods;
