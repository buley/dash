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
     * @private
     */
    get: function (get_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                get_ctx.indexes = get_ctx.objectstore?.indexNames;
                safeApply(get_ctx.on_success, [get_ctx]);
                resolve(get_ctx);
            } catch (error) {
                get_ctx.error = cloneError(error as Error);
                safeApply(get_ctx.on_error, [get_ctx]);
                reject(get_ctx);
            }
        });
    },
    /**
     * Add a new index to an object store.
     * @param add_ctx The context object.
     * @returns Promise<DashContext>
     * @private
     */
    add: function (add_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                add_ctx.objectstore?.createIndex(add_ctx.index, add_ctx.index_key_path, {
                    unique: !!add_ctx.index_unique,
                    multiEntry: !!add_ctx.index_multi_entry
                });
                safeApply(add_ctx.on_success, [add_ctx]);
                resolve(add_ctx);
            } catch (error) {
                add_ctx.error = cloneError(error as Error);
                safeApply(add_ctx.on_error, [add_ctx]);
                reject(add_ctx);
            }
        });
    },
    /**
     * Remove an index from an object store.
     * @param remove_ctx The context object.
     * @returns Promise<DashContext>
     * @private
     */
    remove: function (remove_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                remove_ctx.objectstore?.deleteIndex(remove_ctx.index);
                safeApply(remove_ctx.on_success, [remove_ctx]);
                resolve(remove_ctx);
            } catch (error) {
                remove_ctx.error = cloneError(error as Error);
                safeApply(remove_ctx.on_error, [remove_ctx]);
                reject(remove_ctx);
            }
        });
    },
    /**
     * Clear all entries associated with a specific index.
     * @param clear_ctx The context object.
     * @returns Promise<DashContext>
     * @private
     */
    clearAll: function (clear_ctx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            const request = clear_ctx.objectstore?.index(clear_ctx.index)?.openCursor();

            request?.addEventListener('success', function (event) {
                const cursor = request.result;
                if (cursor) {
                    cursor.delete(); // Delete each entry associated with the index
                    cursor.continue(); // Continue to the next entry
                } else {
                    safeApply(clear_ctx.on_success, [clear_ctx]);
                    resolve(clear_ctx);
                }
            });

            request?.addEventListener('error', function (event) {
                clear_ctx.error = cloneError((event as any).target.error);
                safeApply(clear_ctx.on_error, [clear_ctx]);
                reject(clear_ctx);
            });
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

            request?.addEventListener('success', function (event) {
                const cursor = request.result;
                if (cursor) {
                    safeApply(get_ctx.on_success, [cursor.value]);
                    cursor.continue();
                } else {
                    safeApply(get_ctx.on_complete, [get_ctx]);
                    resolve(get_ctx);
                }
            });

            request?.addEventListener('error', function (event) {
                get_ctx.error = cloneError((event as any).target.error);
                safeApply(get_ctx.on_error, [get_ctx]);
                reject(get_ctx);
            });
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
                safeApply(count_ctx.on_success, [count_ctx]);
                resolve(count_ctx);
            });

            request?.addEventListener('error', function (event: any) {
                count_ctx.error = cloneError((event as any).target.error);
                safeApply(count_ctx.on_error, [count_ctx]);
                reject(count_ctx);
            });
        });
    }
};

export default indexesMethods;