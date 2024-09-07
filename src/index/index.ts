/**
 * Index methods
 * @module index
 */

import { cloneError, DashContext } from "../utilities";

// Index methods
export const indexMethods = {
    /**
     * Get an index.
     * @param get_ctx 
     * @returns Promise<DashContext>
     */
    get: (get_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = get_ctx.idx?.get(get_ctx.key);

            request?.addEventListener('success', () => {
                get_ctx.entry = request.result;
                resolve(get_ctx);
            });

            request?.addEventListener('error', (event) => {
                get_ctx.error = cloneError((event as any).target.error);
                reject(get_ctx);
            });
        });
    },
    /**
     * Remove an index.
     * @param remove_ctx 
     * @returns Promise<DashContext>
     */
    remove: (remove_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            remove_ctx.objectstore?.deleteIndex(remove_ctx.key);
            // Why don't we have success/error handlers?
            // Because this method returns void, not a request object.
            // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/deleteIndex#return_value
            resolve(remove_ctx);
        });
    },
    /**
     * Get indexes.
     * @param ctx 
     * @returns Promise<DashContext>
     */
    getIndexes: (ctx: DashContext) => {
        return new Promise((resolve) => {
            const indexes = ctx.objectstore?.indexNames;
            ctx.indexes = Array.from(indexes || []);
            resolve(ctx);
        });
    }
};

export default indexMethods;