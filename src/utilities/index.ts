/**
 * Common interfaces and utilities.
 * @module utilities
 */

/**
 * @typedef {Object} DashContext
 * @property {Object} [db] - The IDBDatabase object.
 * @property {Object} [transaction] - The IDBTransaction object.
 * @property {DashObjectStore} [objectstore] - The IDBObjectStore object.
 * @property {IDBKeyRange} [range] - The IDBKeyRange object.
 * @property {IDBIndex} [idx] - The IDBIndex object.
 * @property {any} [entry] - The entry.
 * @property {IDBRequest} [request] - The IDBRequest object.
 * @property {any} [error] - The error.
 * @property {any} [key] - The key.
 * @property {Event} [event] - The event.
 * @property {any} [data] - The data.
 * @property {number} [amount] - The amount.
 * @property {string} [type] - The type.
 * @property {Function} [on_success] - The on_success function.
 * @property {Function} [on_error] - The on_error function.
 */
export interface DashContext {
    [key: string]: any;
    db?: IDBDatabase;
    transaction?: IDBTransaction;
    objectstore?: IDBObjectStore;
    range?: IDBKeyRange;
    idx?: IDBIndex;
    entry?: any;
    request?: IDBRequest;
    error?: any;
    key?: any;
    event?: Event;
    data?: any;
    amount?: number;
    type?: string;
    on_success?: (ctx: DashContext) => void;
    on_error?: (ctx: DashContext) => void;
}

/**
 * @typedef {Object} DashEnvironment
 * @property {Document} [document] - The document object.
 * @property {IDBFactory} [indexedDB] - The indexedDB object.
 * @property {typeof IDBKeyRange} [IDBKeyRange] - The IDBKeyRange object.
 * @property {typeof DOMStringList} [DOMStringList] - The DOMStringList object.
 * @property {typeof Worker} [Worker] - The Worker object.
 * @property {Function} constructor - The constructor function.
 * @property {typeof addEventListener} [addEventListener] - The addEventListener function.
 */
export interface DashEnvironment {
    document?: Document;
    indexedDB?: IDBFactory;
    IDBKeyRange?: typeof IDBKeyRange;
    DOMStringList?: typeof DOMStringList;
    Worker?: typeof Worker;
    constructor: Function;
    addEventListener?: typeof addEventListener;
}

/**
 * @typedef {Object} PublicAPI
 * @property {Function} [add] - Add functions.
 * @property {Function} [clear] - Clear functions.
 * @property {Function} [count] - The count functions.
 * @property {Function} [get] - The get functions.
 * @property {Function} [remove] - The remove functions.
 * @property {Function} [update] - The update functions.
 */
export interface PublicAPI {
    add: (ctx: DashContext) => Promise<DashContext>;
    clear: (ctx: DashContext) => Promise<DashContext>;
    count: (ctx: DashContext) => Promise<DashContext>;
    get: (ctx: DashContext) => Promise<DashContext>;
    remove: (ctx: DashContext) => Promise<DashContext>;
    update: (ctx: DashContext) => Promise<DashContext>;
}

/**
 * @typedef {Object} DashBehaviorContext
 * @property {Function} clone - The clone function.
 * @property {Function} contains - The contains function.
 * @property {Function} exists - The exists function.
 * @property {Function} is - The is function.
 * @property {Function} isEmpty - The isEmpty function.
 * @property {Function} isnt - The isnt function.
 * @property {Function} isArray - The isArray function.
 * @property {Function} isBoolean - The isBoolean function.
 * @property {Function} isRegEx - The isRegEx function.
 * @property {Function} isFunction - The isFunction function.
 * @property {Function} isObject - The isObject function.
 * @property {Function} isNumber - The isNumber function.
 * @property {Function} isString - The isString function.
 * @property {Function} apply - The apply function.
 * @property {Function} each - The each function.
 * @property {Function} iterate - The iterate function.
 * @property {Function} random - The random function.
 * @property {PublicAPI} api - The public API object.
 */

export interface DashBehaviorContext {
    clone: typeof clone;
    contains: typeof contains;
    exists: typeof exists;
    is: typeof is;
    isEmpty: typeof isEmpty;
    isnt: typeof isnt;
    isArray: typeof isArray;
    isBoolean: typeof isBoolean;
    isRegEx: typeof isRegEx;
    isFunction: typeof isFunction;
    isObject: typeof isObject;
    isNumber: typeof isNumber;
    isString: typeof isString;
    apply: typeof safeApply;
    each: typeof safeEach;
    iterate: typeof safeIterate;
    random: typeof randomId;
    api: PublicAPI;
}
/**
 * @typedef {Object} DashObjectStore
 * @property {string | null} [keyPath] - The key path.
 * @property {boolean} [autoIncrement] - Whether to auto-increment.
 * @property {Function} [clear] - The clear function.
 * @property {Function} [deleteObjectStore] - The deleteObjectStore function.
 * @property {Function} [put] - The put function.
 * @property {Function} [index] - The index function.
 */
export interface DashObjectStore {
    keyPath?: string | null;
    autoIncrement?: boolean;
    clear?: () => void;
    deleteObjectStore?: (store: string) => void;
    put?: (data: any, key?: any) => IDBRequest;
    index?: (name: string) => IDBIndex;
}

/**
 * @typedef {Object} DashIndex
 * @property {string} name - The name.
 * @property {boolean} multiEntry - Whether it's a multi-entry index.
 * @property {boolean} unique - Whether it's a unique index.
 * @property {string} keyPath - The key path.
 */
export interface DashIndex {
    name: string;
    multiEntry: boolean;
    unique: boolean;
    keyPath: string;
}

/**
 * @typedef {Object} DashProviderCacheObj
 * @property {Object} [database] - The database object.
 * @property {Object} [stores] - The stores object.
 * @property {Object} [indexes] - The indexes object.
 * @property {DashIndex} [data] - The data object.
 */
export interface DashProviderCacheObj {
    [database: string]: {
        stores: {
            [store: string]: {
                indexes: {
                    [index: string]: {
                        data: DashIndex;
                    };
                };
                data: any;
            };
        };
        data: any;
    };
}


/**
 * @param {DashContext} ctx - The context.
 * @returns {Promise<DashContext>} The promise object.
 * @private
 */
export function cloneError(err: Error): Error {
    const clone = new Error(err.message);
    clone.name = err.name;
    return clone;
}

// Clone function that performs a deep copy of an object, array, or function
export const clone = (obj: any): any => {
    if (typeof obj === 'function') {
        const clo = function (this: any, ...args: any[]) {
            return obj.apply(this, args);
        };
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                (clo as { [key: string]: any })[key] = obj[key];
            }
        }
        return clo;
    }
    if (typeof obj === 'number') return parseInt(obj.toString(), 10);
    if (Array.isArray(obj)) return obj.map(clone);
    if (typeof obj === 'object' && obj !== null) {
        const clo: { [key: string]: any } = {};
        for (const key in obj) {
            clo[key] = clone(obj[key]);
        }
        return clo;
    }
    return obj;
};

// Checks if an item exists in an array or object
export const contains = (haystack: any, needle: any, use_key?: boolean): boolean => {
    if (Array.isArray(haystack)) {
        return haystack.some((value, key) => (use_key ? key === needle : value === needle));
    } else if (typeof haystack === 'object') {
        return Object.keys(haystack).some((key) => (use_key ? key === needle : haystack[key] === needle));
    }
    return false;
};

// Checks whether a value exists
export const exists = (mixed_var: any): boolean => !isEmpty(mixed_var);

// Checks if a variable is empty
export const isEmpty = (mixed_var: any): boolean => {
    if (typeof mixed_var === 'object') {
        return Object.keys(mixed_var).length === 0;
    }
    return !mixed_var;
};

// Utility functions to check the type of variables
export const is = (type: string, mixed_var: any): boolean => typeof mixed_var === type;
export const isnt = (type: string, mixed_var: any): boolean => !is(type, mixed_var);
export const isArray = Array.isArray;
export const isBoolean = (mixed_var: any): boolean => typeof mixed_var === 'boolean';
export const isRegEx = (mixed_var: any): boolean => mixed_var instanceof RegExp;
export const isFunction = (mixed_var: any): boolean => typeof mixed_var === 'function';
export const isObject = (mixed_var: any): boolean => typeof mixed_var === 'object' && mixed_var !== null && !Array.isArray(mixed_var);
export const isNumber = (mixed_var: any): boolean => typeof mixed_var === 'number';
export const isString = (mixed_var: any): boolean => typeof mixed_var === 'string';

// Applies a function if it's defined
export const safeApply = (fn: Function | undefined, args: any[], context?: any, err?: Function): any => {
    if (typeof fn === 'function') return fn.apply(context || {}, args || []);
    if (typeof err === 'function') return safeApply(err, []);
};

// Iterates through an array and applies a callback function
export const safeEach = (items: any[], callback: (item: any, index: number) => void, inc = 1): void => {
    for (let x = 0; x < items.length; x += inc) {
        safeApply(callback, [items[x], x]);
    }
};

// Iterates through an object's properties and applies a callback function
export const safeIterate = (item: any, callback: (key: string, value: any) => void): void => {
    for (const attr in item) {
        if (item.hasOwnProperty(attr)) {
            callback(attr, item[attr]);
        }
    }
};

// Generates a random string ID
export const randomId = (len = 16, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string => {
    let str = '';
    for (let i = 0; i < len; i++) {
        str += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return str;
};


export default {
    cloneError,
    clone,
    contains,
    exists,
    isEmpty,
    is,
    isnt,
    isArray,
    isBoolean,
    isRegEx,
    isFunction,
    isObject,
    isNumber,
    isString,
    safeApply,
    safeEach,
    safeIterate,
    randomId
};