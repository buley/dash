import { cloneError, DashContext, exists } from "../utilities";

export const databaseMethods = {
    get: (get_ctx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            const request = get_ctx.objectstore?.get(get_ctx.key);
            if (!request) {
                get_ctx.error = { message: 'Invalid object store', name: 'DashError' };
                reject(get_ctx);
                return;
            }

            request.onsuccess = (event: Event) => {
                const result = (event.target as IDBRequest).result;
                if (!result) {
                    get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
                    reject(get_ctx);
                } else {
                    get_ctx.entry = result;
                    resolve(get_ctx);
                }
            };

            request.onerror = (event: Event) => {
                const error = (event.target as IDBRequest).error;
                get_ctx.error = error ? cloneError(error) : { message: 'Unknown error', name: 'DashError' };
                reject(get_ctx);
            };
        });
    },

    put: (put_ctx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            const request = exists(put_ctx.key)
                ? put_ctx.objectstore?.put(put_ctx.data, put_ctx.key)
                : put_ctx.objectstore?.put(put_ctx.data);

            if (!request) {
                put_ctx.error = { message: 'Invalid object store', name: 'DashError' };
                reject(put_ctx);
                return;
            }

            request.onsuccess = (event: Event) => {
                put_ctx.key = (event.target as IDBRequest).result;
                put_ctx.entry = put_ctx.data;
                resolve(put_ctx);
            };

            request.onerror = (event: Event) => {
                const error = (event.target as IDBRequest).error;
                put_ctx.error = error ? cloneError(error) : { message: 'Unknown error', name: 'DashError' };
                reject(put_ctx);
            };
        });
    },

    remove: (remove_ctx: DashContext): Promise<DashContext> => {
        return new Promise((resolve, reject) => {
            const request = remove_ctx.objectstore?.delete(remove_ctx.key);

            if (!request) {
                remove_ctx.error = { message: 'Invalid object store', name: 'DashError' };
                reject(remove_ctx);
                return;
            }

            request.onsuccess = () => {
                resolve(remove_ctx);
            };

            request.onerror = (event: Event) => {
                const error = (event.target as IDBRequest).error;
                remove_ctx.error = error ? cloneError(error) : { message: 'Unknown error', name: 'DashError' };
                reject(remove_ctx);
            };
        });
    }
};

export default databaseMethods;