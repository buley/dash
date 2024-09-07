
/**
 * Store methods
 * @module store
 */

import { cloneError, DashContext, exists } from "../utilities";

// Store methods
export const storeMethods = {
    /**
     * Clear a store.
     * @param clear_ctx 
     * @returns Promise<DashContext>
     */
    clear: (clear_ctx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            const request: IDBRequest<any> | undefined = clear_ctx.objectstore?.clear();

            request?.addEventListener('success', () => {
                if (clear_ctx.on_success) {
                    clear_ctx.on_success(clear_ctx);  // Call the success callback here
                }
                resolve(clear_ctx);
            });

            request?.addEventListener('error', (event) => {
                clear_ctx.error = cloneError((event as any).target.error);
                if (clear_ctx.on_error) {
                    clear_ctx.on_error(clear_ctx);  // Call the error callback here
                }
                reject(clear_ctx);
            });
        });
    },
    
    /**
     * Remove a store entry.
     * @param remove_ctx 
     * @returns Promise<DashContext>
     */
    remove: (remove_ctx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            const request: IDBRequest<any> | undefined = remove_ctx.objectstore?.delete(remove_ctx.key);

            request?.addEventListener('success', () => {
                if (remove_ctx.on_success) {
                    remove_ctx.on_success(remove_ctx);  // Call the success callback here
                }
                resolve(remove_ctx);
            });

            request?.addEventListener('error', (event) => {
                remove_ctx.error = cloneError((event as any).target.error);
                if (remove_ctx.on_error) {
                    remove_ctx.on_error(remove_ctx);  // Call the error callback here
                }
                reject(remove_ctx);
            });
        });
    },

    /**
     * Get a store entry.
     * @param get_ctx 
     * @returns Promise<DashContext>
     */
    get: (get_ctx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            const request: IDBRequest<any> | undefined = exists(get_ctx.index)
                ? get_ctx.objectstore?.index(get_ctx.index)?.get(get_ctx.key) as IDBRequest<any>
                : get_ctx.objectstore?.get(get_ctx.key) as IDBRequest<any>;

            request?.addEventListener('success', () => {
                get_ctx.entry = request.result;
                if (!get_ctx.entry) {
                    get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
                    if (get_ctx.on_error) {
                        get_ctx.on_error(get_ctx);  // Call the error callback here
                    }
                    reject(get_ctx);
                } else {
                    if (get_ctx.on_success) {
                        get_ctx.on_success(get_ctx);  // Call the success callback here
                    }
                    resolve(get_ctx);
                }
            });

            request?.addEventListener('error', (event) => {
                get_ctx.error = cloneError((event as any).target.error);
                if (get_ctx.on_error) {
                    get_ctx.on_error(get_ctx);  // Call the error callback here
                }
                reject(get_ctx);
            });
        });
    }
};

// Export the store methods
export default storeMethods;
