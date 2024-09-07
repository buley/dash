/**
 * Database methods.
 * @module database
 */
import { cloneError, DashContext, exists } from "../utilities";

// Various database methods
export const databaseMethods = {
    /**
     * Get a database.
     * @param get_ctx 
     * @returns Promise<DashContext>
     */
    get: (get_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = get_ctx.objectstore?.get(get_ctx.key);

            const onSuccess = () => {
                if (!request?.result) {
                    get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
                    reject(get_ctx);
                } else {
                    resolve(get_ctx);
                }
                cleanupListeners();
            };

            const onError = (event: Event) => {
                get_ctx.error = cloneError((event as any).target.error);
                reject(get_ctx);
                cleanupListeners();
            };

            const cleanupListeners = () => {
                request?.removeEventListener('success', onSuccess);
                request?.removeEventListener('error', onError);
            };

            request?.addEventListener('success', onSuccess);
            request?.addEventListener('error', onError);
        });
    },
    /**
     * Put a database.
     * @param put_ctx 
     * @returns Promise<DashContext>
     */
    put: (put_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = exists(put_ctx.key)
                ? put_ctx.objectstore?.put(put_ctx.data, put_ctx.key)
                : put_ctx.objectstore?.put(put_ctx.data);

            const onSuccess = () => {
                put_ctx.key = request?.result;
                put_ctx.entry = put_ctx.data;
                resolve(put_ctx);
                cleanupListeners();
            };

            const onError = (event: Event) => {
                put_ctx.error = cloneError((event as any).target.error);
                reject(put_ctx);
                cleanupListeners();
            };

            const cleanupListeners = () => {
                request?.removeEventListener('success', onSuccess);
                request?.removeEventListener('error', onError);
            };

            request?.addEventListener('success', onSuccess);
            request?.addEventListener('error', onError);
        });
    },
    /**
     * Remove a database.
     * @param remove_ctx 
     * @returns Promise<DashContext>
     */
    remove: (remove_ctx: DashContext) => {
        return new Promise((resolve, reject) => {
            const request = remove_ctx.objectstore?.delete(remove_ctx.key);

            const onSuccess = () => {
                resolve(remove_ctx);
                cleanupListeners();
            };

            const onError = (event: Event) => {
                remove_ctx.error = cloneError((event as any).target.error);
                reject(remove_ctx);
                cleanupListeners();
            };

            const cleanupListeners = () => {
                request?.removeEventListener('success', onSuccess);
                request?.removeEventListener('error', onError);
            };

            request?.addEventListener('success', onSuccess);
            request?.addEventListener('error', onError);
        });
    }
};

export default databaseMethods;