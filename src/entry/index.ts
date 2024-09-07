
/**
 * Entry methods
 * @module entry
 */

import { cloneError, DashContext } from "../utilities";

// Entry methods
export const entryMethods = {
    /**
     * Add an entry.
     * @param add_ctx 
     * @returns Promise<DashContext>
     */
    add: (add_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = add_ctx.objectstore?.add(add_ctx.data, add_ctx.key);

            if (!request) {
                add_ctx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(add_ctx);
            }

            request.addEventListener('success', () => {
                add_ctx.key = request.result;
                add_ctx.entry = add_ctx.data;
                resolve(add_ctx);
            });

            request.addEventListener('error', (event) => {
                add_ctx.error = cloneError((event as any).target.error);
                reject(add_ctx);
            });
        });
    },

    /**
     * Get an entry.
     * @param get_ctx
     * @returns Promise<DashContext>
     */
    get: (get_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            let request;

            if (get_ctx.index && get_ctx.objectstore && typeof get_ctx.objectstore.index === 'function') {
                const index = get_ctx.objectstore.index(get_ctx.index);
                if (index && typeof index.get === 'function') {
                    request = index.get(get_ctx.key);
                } else {
                    get_ctx.error = { message: 'Invalid index or get method', name: 'DashInvalidIndex' };
                    return reject(get_ctx);
                }
            } else if (get_ctx.objectstore && typeof get_ctx.objectstore.get === 'function') {
                request = get_ctx.objectstore.get(get_ctx.key);
            } else {
                get_ctx.error = { message: 'Invalid objectstore or get method', name: 'DashInvalidObjectStore' };
                return reject(get_ctx);
            }

            if (!request) {
                get_ctx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(get_ctx);
            }

            request.addEventListener('success', () => {
                get_ctx.entry = request.result;
                resolve(get_ctx);
            });

            request.addEventListener('error', (event) => {
                get_ctx.error = cloneError((event as any).target.error);
                reject(get_ctx);
            });
        });
    },

    /**
     * Put an entry.
     * @param put_ctx 
     * @returns Promise<DashContext>
     */
    put: (put_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = put_ctx.objectstore?.put(put_ctx.data, put_ctx.key);

            if (!request) {
                put_ctx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(put_ctx);
            }

            request.addEventListener('success', () => {
                put_ctx.entry = put_ctx.data;
                resolve(put_ctx);
            });

            request.addEventListener('error', (event) => {
                put_ctx.error = cloneError((event as any).target.error);
                reject(put_ctx);
            });
        });
    },

    /**
     * Remove an entry.
     * @param remove_ctx 
     * @returns Promise<DashContext>
     */
    remove: (remove_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = remove_ctx.objectstore?.delete(remove_ctx.key);

            if (!request) {
                remove_ctx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(remove_ctx);
            }

            request.addEventListener('success', () => {
                resolve(remove_ctx);
            });

            request.addEventListener('error', (event) => {
                remove_ctx.error = cloneError((event as any).target.error);
                reject(remove_ctx);
            });
        });
    },

    /**
     * Update an entry.
     * @param update_ctx 
     * @returns Promise<DashContext>
     */
    update: (update_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = update_ctx.objectstore?.put(update_ctx.data, update_ctx.key);

            if (!request) {
                update_ctx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(update_ctx);
            }

            request.addEventListener('success', () => {
                update_ctx.entry = update_ctx.data;
                resolve(update_ctx);
            });

            request.addEventListener('error', (event) => {
                update_ctx.error = cloneError((event as any).target.error);
                reject(update_ctx);
            });
        });
    },

    /**
     * Count entries.
     * @param count_ctx 
     * @returns Promise<DashContext>
     */
    count: (count_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = count_ctx.objectstore?.count(count_ctx.range);

            if (!request) {
                count_ctx.error = { message: "Request object is null", name: "DashRequestError" };
                return reject(count_ctx);
            }

            request.addEventListener('success', () => {
                count_ctx.amount = request.result;
                resolve(count_ctx);
            });

            request.addEventListener('error', (event) => {
                count_ctx.error = cloneError((event as any).target.error);
                reject(count_ctx);
            });
        });
    }
};

export default entryMethods;
