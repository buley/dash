/**
 * Stores methods.
 * @Module stores
 */
import { cloneError, DashContext, exists, safeApply } from "../utilities";

// Store methods
export const storesMethods = {
    /**
     * Get all object stores from the current database.
     * @param get_ctx The context object.
     * @returns Promise<DashContext>
     * @private
     */
    get: function (get_ctx: DashContext) {
        // This method retrieves all object stores synchronously or asynchronously via an on_success callback.
        get_ctx.stores = get_ctx.db?.objectStoreNames;
        safeApply(get_ctx.on_success, [get_ctx]);
    },
    /**
     * Add a new object store to the current database.
     * @param add_ctx The context object.
     * @returns Promise<DashContext>
     * @private
     */
    add: function (add_ctx: DashContext) {
        // This method adds a new object store in the database, creating a version change.
        add_ctx.db = add_ctx.request?.result;
        if (!add_ctx.db) {
            throw new Error("Database is undefined");
        }
        const store = add_ctx.db.createObjectStore(add_ctx.store, {
            keyPath: add_ctx.store_key_path || null,
            autoIncrement: !!add_ctx.auto_increment
        });

        if (add_ctx.request) {
            add_ctx.db = add_ctx.request.result;
        }

        if (add_ctx.indexes) {
            // If there are indexes defined, we create them in the new store
            add_ctx.indexes.forEach((idx: any) => {
                store.createIndex(idx.name, idx.keyPath, {
                    unique: !!idx.unique,
                    multiEntry: !!idx.multiEntry
                });
            });
        }

        safeApply(add_ctx.on_success, [add_ctx]);
    },
    /**
     * Remove an object store from the current database.
     * @param remove_ctx The context object.
     * @returns Promise<DashContext>
     * @private
     */
    remove: function (remove_ctx: DashContext) {
        // This method deletes a specified object store, triggering a version change.
        remove_ctx.db?.deleteObjectStore(remove_ctx.store);
        safeApply(remove_ctx.on_success, [remove_ctx]);
    },
    /**
     * Clear all object stores in the current database.
     * @param clear_ctx The context object.
     * @returns Promise<DashContext>
     * @private
     */
    clearAll: function (clear_ctx: DashContext) {
        // This method clears all entries in all object stores in the current database.
        const storeNames = Array.from(clear_ctx.db?.objectStoreNames || []);
        const transaction = clear_ctx.db?.transaction(storeNames as any, "readwrite");

        storeNames?.forEach((storeName: string) => {
            const objectStore = transaction?.objectStore(storeName);
            objectStore?.clear();
        });

        transaction?.addEventListener('complete', () => {
            safeApply(clear_ctx.on_success, [clear_ctx]);
        });

        transaction?.addEventListener('error', (event) => {
            clear_ctx.error = cloneError((event as any).target.error);
            safeApply(clear_ctx.on_error, [clear_ctx]);
        });
    }
};
export default storesMethods;