/**
 * Represents a cache item with data and expiration time.
 */
interface CacheItem {
    data: any;
    expire: number;
}

/**
 * Represents a request for cache operations.
 */
interface Request {
    key?: string;
    value?: any;
    expires?: number;
}

/**
 * Represents the context for building a cache key.
 */
interface KeyContext {
    database: string;
    store: string;
    index: string;
    key: string;
    primaryKey: string;
    limit: number;
}

/**
 * Represents a message sent to the worker.
 */
interface WorkerMessage {
    [x: string]: string | number;
    method: string;
    context: any;
    expires: string | number;
    value: any;
}

/**
 * Callback functions for handling cache operations.
 */
interface Callbacks {
    onSuccess?: (data: any) => void;
    onError?: (data: any) => void;
    onAbort?: (data: any) => void;
    onComplete?: (data: any) => void;
    onUpgradeNeeded?: (data: any) => void;
    onBlocked?: (data: any) => void;
    onClose?: (data: any) => void;
}

/**
 * DashCache class that handles caching of data with optional worker support.
 */
class DashCache {
    // Cache object to store cached data
    private cache: { [key: string]: CacheItem } = {};
    private that: any = this;
    private worker: Worker | null = null;
    private workQueue: { [key: string]: any } = {};

    constructor(private environment: any) {
        // Initialize worker environment if applicable
        if (this.isWorkerEnvironment()) {
            this.setupWorkerListener();
        }
    }

    /**
     * Sets a value in the cache with an optional expiration time.
     * @param request - The request containing the key, value, and expiration time.
     * @returns The cached data or undefined if no key is provided.
     */
    private set(request: Request): any {
        const key = request.key || null;
        const value = request.value || null;
        const expires = request.expires || 3000; // Default expiration of 3000ms
        const timestamp = new Date().getTime() + expires;

        if (!key) return;

        this.cache[key] = {
            data: value,
            expire: timestamp,
        };

        return this.cache[key].data;
    }

    /**
     * Retrieves a value from the cache if it hasn't expired.
     * @param request - The request containing the key.
     * @returns The cached data or null if the key is not found or expired.
     */
    private get(request: Request): any {
        const key = request.key || '';

        if (!key || !this.cache[key]) return null;

        // Check if the cached item has expired
        if (this.cache[key].expire > new Date().getTime()) {
            return this.cache[key].data;
        }

        // Delete the expired cache item
        delete this.cache[key];
        return null;
    }

    /**
     * Deletes a value from the cache based on the provided key.
     * @param request - The request containing the key.
     * @returns The deleted cache item or undefined if the key is not found.
     */
    private zap(request: Request): any {
        const key = request.key || '';
        const result = this.cache[key];

        delete this.cache[key]; // Remove the item from the cache
        return result;
    }

    /**
     * Builds a cache key based on the context provided.
     * @param keyCtx - The context for constructing the key.
     * @returns The constructed key as a string.
     */
    private buildKey(keyCtx: KeyContext): string {
        // Concatenate the context properties to form the key, skipping null/undefined
        return [
            keyCtx.database,
            keyCtx.store,
            keyCtx.index,
            keyCtx.key,
            keyCtx.primaryKey,
            keyCtx.limit,
        ]
            .filter(Boolean) // Only keep non-empty values
            .join('.'); // Join with a dot separator
    }

    /**
     * Checks if the current environment is a worker environment.
     * @returns True if the environment is a worker, false otherwise.
     */
    private isWorkerEnvironment(): boolean {
        return !!this.environment.constructor.toString().match(/WorkerGlobalScope/);
    }

    /**
     * Sets up a listener for worker messages to handle cache operations.
     */
    private setupWorkerListener(): void {
        this.environment.addEventListener('message', (e: MessageEvent) => {
            const input = e.data as WorkerMessage;
            const { method, context } = input;

            // Dispatch the method to handle the cache operation
            if (method === 'get') {
                this.end(this.get(context));
            } else if (method === 'set') {
                this.end(this.set(context));
            } else if (method === 'delete') {
                this.end(this.zap(context));
            } else {
                // If the method is invalid, return an error response
                input.type = 'error';
                this.end({
                    type: 'abort',
                    context: input,
                    error: 'No such method',
                });
            }
        });
    }

    /**
     * Finalizes the worker response and posts it back to the main thread.
     * @param context - The result context to send back.
     */
    private end(context: any): void {
        this.environment.postMessage(context); // Send result back to the worker
        setTimeout(() => {
            this.pruneCache(); // Clean up expired cache items
        });
    }

    /**
     * Prunes expired items from the cache.
     */
    private pruneCache(): void {
        const now = new Date().getTime();
        Object.keys(this.cache).forEach((key) => {
            if (this.cache[key].expire < now) {
                delete this.cache[key];
            }
        });
    }
}
