
/**
 * Indexes methods
 * @module indexes
 */
import { cloneError, DashContext, safeApply } from "../utilities";

// Indexes methods
export const indexesMethods = {
    /**
     * Get all indexes from a specific object store.
     * @param get_ctx The context object.
     * @returns Promise<DashContext>
     */
    get: function (get_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                get_ctx.indexes = get_ctx.objectstore?.indexNames;
                if (get_ctx.on_success) {
                    safeApply(get_ctx.on_success, [get_ctx]);
                }
                resolve(get_ctx);
            } catch (error) {
                get_ctx.error = cloneError(error as Error);
                if (get_ctx.on_error) {
                    safeApply(get_ctx.on_error, [get_ctx]);
                }
                reject(get_ctx);
            }
        });
    },

    /**
     * Add a new index to an object store.
     * @param add_ctx The context object.
     * @returns Promise<DashContext>
     */
    add: function (add_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                add_ctx.objectstore?.createIndex(add_ctx.index, add_ctx.index_key_path, {
                    unique: !!add_ctx.index_unique,
                    multiEntry: !!add_ctx.index_multi_entry
                });
                if (add_ctx.on_success) {
                    safeApply(add_ctx.on_success, [add_ctx]);
                }
                resolve(add_ctx);
            } catch (error) {
                add_ctx.error = cloneError(error as Error);
                if (add_ctx.on_error) {
                    safeApply(add_ctx.on_error, [add_ctx]);
                }
                reject(add_ctx);
            }
        });
    },

    /**
     * Remove an index from an object store.
     * @param remove_ctx The context object.
     * @returns Promise<DashContext>
     */
    remove: function (remove_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                remove_ctx.objectstore?.deleteIndex(remove_ctx.index);
                if (remove_ctx.on_success) {
                    safeApply(remove_ctx.on_success, [remove_ctx]);
                }
                resolve(remove_ctx);
            } catch (error) {
                remove_ctx.error = cloneError(error as Error);
                if (remove_ctx.on_error) {
                    safeApply(remove_ctx.on_error, [remove_ctx]);
                }
                reject(remove_ctx);
            }
        });
    },
    /**
 * Get all entries from a specific index.
 * @param get_ctx The context object.
 * @returns Promise<DashContext>
 */
    getEntries: function (get_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            const request = get_ctx.objectstore?.index(get_ctx.index)?.openCursor();

            if (!request) {
                get_ctx.error = new Error("Failed to open cursor");
                if (get_ctx.on_error) {
                    safeApply(get_ctx.on_error, [get_ctx]);
                }
                reject(get_ctx);
                return;
            }

            request.onsuccess = function (event) {
                const cursor = request.result;
                if (cursor) {
                    if (get_ctx.on_success) {
                        safeApply(get_ctx.on_success, [cursor.value]);
                    }
                    cursor.continue();
                } else {
                    if (get_ctx.on_complete) {
                        safeApply(get_ctx.on_complete, [get_ctx]);
                    }
                    resolve(get_ctx);
                }
            };

            request.onerror = function (event) {
                get_ctx.error = cloneError(request.error!);
                if (get_ctx.on_error) {
                    safeApply(get_ctx.on_error, [get_ctx]);
                }
                reject(get_ctx);
            };
        });
    },
    /**
     * Counts the number of entries in a specific index.
     * @param count_ctx The context object.
     * @returns Promise<DashContext>
     */
    countEntries: function (count_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            const request = count_ctx.objectstore?.index(count_ctx.index)?.count();

            request?.addEventListener('success', function () {
                count_ctx.total = request.result;
                if (count_ctx.on_success) {
                    safeApply(count_ctx.on_success, [count_ctx]);
                }
                resolve(count_ctx);
            });

            request?.addEventListener('error', function (event: any) {
                count_ctx.error = cloneError((event as any).target.error);
                if (count_ctx.on_error) {
                    safeApply(count_ctx.on_error, [count_ctx]);
                }
                reject(count_ctx);
            });
        });
    }
};

export default indexesMethods;
