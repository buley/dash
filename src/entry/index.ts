/**
 * Entry methods
 * @module entry
 */

import { cloneError, DashContext, exists } from "../utilities";

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

            request?.addEventListener('success', () => {
                add_ctx.key = request.result;
                add_ctx.entry = add_ctx.data;
                resolve(add_ctx);
            });

            request?.addEventListener('error', (event) => {
                add_ctx.error = cloneError((event as any).target.error);
                reject(add_ctx);
            });
        });
    },
    /**
     * Get an entry.
     * @param get_ctx
     * @returns Promise<DashContext>
     * @private'
     */
    get: (get_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = exists(get_ctx.index)
                ? get_ctx.objectstore?.index(get_ctx.index)?.get(get_ctx.key)
                : get_ctx.objectstore?.get(get_ctx.key);

            request?.addEventListener('success', () => {
                get_ctx.entry = request.result;
                if (!get_ctx.entry) {
                    get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
                    reject(get_ctx);
                } else {
                    resolve(get_ctx);
                }
            });

            request?.addEventListener('error', (event) => {
                get_ctx.error = cloneError((event as any).target.error);
                reject(get_ctx);
            });
        });
    },
    /**
     * Put an entry.
     * @param put_ctx 
     * @returns Promise<DashContext>
     * @private
     */
    put: (put_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = exists(put_ctx.key)
                ? put_ctx.objectstore?.put(put_ctx.data, put_ctx.key)
                : put_ctx.objectstore?.put(put_ctx.data);

            request?.addEventListener('success', () => {
                put_ctx.key = request.result;
                put_ctx.entry = put_ctx.data;
                resolve(put_ctx);
            });

            request?.addEventListener('error', (event) => {
                put_ctx.error = cloneError((event as any).target.error);
                reject(put_ctx);
            });
        });
    },
    /**
     * Remove an entry.
     * @param remove_ctx 
     * @returns Promise<DashContext>
     * @private
     */
    remove: (remove_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = remove_ctx.objectstore?.delete(remove_ctx.key);

            request?.addEventListener('success', () => {
                resolve(remove_ctx);
            });

            request?.addEventListener('error', (event) => {
                remove_ctx.error = cloneError((event as any).target.error);
                reject(remove_ctx);
            });
        });
    },
    /**
     * Update an entry.
     * @param update_ctx 
     * @returns Promise<DashContext>
     * @private
     */
    update: (update_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = update_ctx.objectstore?.put(update_ctx.data, update_ctx.key);

            request?.addEventListener('success', () => {
                update_ctx.entry = update_ctx.data;
                resolve(update_ctx);
            });

            request?.addEventListener('error', (event) => {
                update_ctx.error = cloneError((event as any).target.error);
                reject(update_ctx);
            });
        });
    },
    /**
     * Count entries.
     * @param count_ctx 
     * @returns Promise<DashContext>
     * @private
     */
    count: (count_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = count_ctx.objectstore?.count(count_ctx.range);

            request?.addEventListener('success', () => {
                count_ctx.amount = request.result;
                resolve(count_ctx);
            });

            request?.addEventListener('error', (event) => {
                count_ctx.error = cloneError((event as any).target.error);
                reject(count_ctx);
            });
        });
    }
};

export default entryMethods;