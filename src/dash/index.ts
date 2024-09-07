/* Repo -> http://github.com/buley/dash
 * License -> MIT
 * Author -> Taylor Buley (@taylorbuley)
 * Copyright -> (c) 2011-2024 Taylor Buley
 */

interface DashEnvironment {
  document?: Document;
  indexedDB?: IDBFactory;
  IDBKeyRange?: typeof IDBKeyRange;
  DOMStringList?: typeof DOMStringList;
  Worker?: typeof Worker;
  constructor: Function;
  addEventListener?: typeof addEventListener;
}

interface DashDeferred<T = any> {
  promise: (on_success?: (value: T) => void, on_error?: (error: any) => void, on_notify?: (value: T) => void) => DashDeferred<T>;
  resolve: (...args: any[]) => void;
  reject: (...args: any[]) => void;
  notify: (...args: any[]) => void;
}

interface DashObjectStore {
  keyPath?: string | null;
  autoIncrement?: boolean;
  clear?: () => void;
  deleteObjectStore?: (store: string) => void;
  put?: (data: any, key?: any) => IDBRequest;
  index?: (name: string) => IDBIndex;
}

interface DashContext {
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

interface DashIndex {
  name: string;
  multiEntry: boolean;
  unique: boolean;
  keyPath: string;
}

interface DashProviderCacheObj {
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

const dash = ((environment: DashEnvironment) => {
  'use strict';

  const scripts = environment.document?.getElementsByTagName("script") || [];
  const libraryScript = scripts[scripts.length - 1] || null;
  const libraryPath = libraryScript?.src.match(/chrome-extension/) ? null : libraryScript?.src;

  const database: Record<string, any> = {};
  const databases: Record<string, any> = {};
  const store: Record<string, any> = {};
  const stores: Record<string, any> = {};
  const index: Record<string, any> = {};
  const indexes: Record<string, any> = {};
  const range: Record<string, any> = {};
  const entry: Record<string, any> = {};
  const entries: Record<string, any> = {};
  const behavior: Record<string, any> = {};
  const providerCacheObj: DashProviderCacheObj = {};

  const db = environment.indexedDB || indexedDB;
  const kr = environment.IDBKeyRange || IDBKeyRange;
  const sl = environment.DOMStringList || (self ? Array : DOMStringList);
  const workerEnvironment = environment.constructor.toString().match(/WorkerGlobalScope/) !== null;
  const webkitEnvironment = !!(db as any).webkitGetDatabaseNames;
  const workerPresent = !!self.Worker;

  const clone = (obj: any): any => {
    if (typeof obj === 'function') {
      const clo = function (this: any, ...args: any[]) {
        return obj.apply(this, args);
      } as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clo[key] = obj[key];
        }
      }
      return clo;
    }
    if (typeof obj === 'number') return parseInt(obj.toString(), 10);
    if (Array.isArray(obj)) return obj.map(clone);
    if (typeof obj === 'object' && obj !== null) {
      const clo: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clo[key] = clone(obj[key]);
        }
      }
      return clo;
    }
    return obj;
  };

  const pluck = (fields: string[], from: Record<string, any>): Record<string, any> => {
    const obj: Record<string, any> = {};
    fields.forEach(field => obj[field] = clone(from[field]));
    return obj;
  };

  const cloneError = (err: Error) => pluck(['message', 'name'], err);

  const isEmpty = (mixed_var: any): boolean => {
    if (typeof mixed_var === 'object') {
      return Object.keys(mixed_var).length === 0;
    }
    return !mixed_var;
  };

  const exists = (mixed_var: any): boolean => !isEmpty(mixed_var);

  const safeApply = (fn: Function | undefined, args: any[], context?: any, err?: Function): any => {
    if (typeof fn === 'function') return fn.apply(context || {}, args || []);
    if (typeof err === 'function') return safeApply(err, []);
  };

  const deferred = <T = any>(): DashDeferred<T> => {
    let complete = false;
    let wasSuccess: boolean | null = null;
    let completed: any[] = [];
    let children: DashDeferred<T>[] = [];
    let notifies: ((value: T) => void)[] = [];
    let successes: ((value: T) => void)[] = [];
    let errors: ((value: any) => void)[] = [];

    return {
      promise(on_success?: (value: T) => void, on_error?: (error: any) => void, on_notify?: (value: T) => void): DashDeferred<T> {
        const defd = deferred<T>();
        children.push(defd);

        if (complete) safeApply(wasSuccess ? on_success : on_error, completed);

        [[successes, on_success], [errors, on_error], [notifies, on_notify]].forEach(([arr, fn]) => {
          if (Array.isArray(arr) && typeof fn === 'function') arr.push(fn as (arg: any) => void);
        });

        return defd;
      },
      resolve(...args: any[]): void {
        wasSuccess = true;
        complete = true;
        completed = args;
        successes.forEach(on_success => safeApply(on_success, args));
        children.forEach(child => child.resolve(...args));
      },
      notify(...args: any[]): void {
        notifies.forEach(on_notify => safeApply(on_notify, args));
        children.forEach(child => child.notify(...args));
      },
      reject(...args: any[]): void {
        wasSuccess = false;
        complete = true;
        completed = args;
        errors.forEach(on_error => safeApply(on_error, args));
      }
    };
  };

  const transactionType = (method: string): string => {
    if (['add.index', 'remove.index', 'add.store', 'remove.store'].includes(method)) {
      return "versionchange";
    }
    if (['get.entry', 'get.entries'].includes(method)) {
      return "readonly";
    }
    return "readwrite";
  };

  const safeEach = (items: any[], callback: (item: any, index: number) => void, inc = 1): void => {
    for (let x = 0; x < items.length; x += inc) {
      safeApply(callback, [items[x], x]);
    }
  };

  const safeIterate = (item: any, callback: (key: string, value: any) => void): void => {
    for (const attr in item) {
      if (item.hasOwnProperty(attr)) {
        callback(attr, item[attr]);
      }
    }
  };

  const standardCursor = (cursor_ctx: DashContext, getRequest: (ctx: DashContext) => void): void => {
    let count = 0;
    let { limit, skip } = cursor_ctx;


    cursor_ctx.direction = cursor_ctx.direction || (exists(cursor_ctx) && cursor_ctx.duplicates === false) ? 'nextunique' : 'next';
    cursor_ctx.range = cursor_ctx.range || range.get(cursor_ctx);
    cursor_ctx.data = exists(cursor_ctx.data) ? clone(cursor_ctx.data) : cursor_ctx.data;

    if (!exists(cursor_ctx.transaction)) {
      cursor_ctx.db = (cursor_ctx.event?.target as IDBOpenDBRequest)?.result;
      cursor_ctx.transaction = cursor_ctx.db?.transaction([cursor_ctx.store], 'readonly');
    }

    if (!exists(cursor_ctx.objectstore)) {
      cursor_ctx.objectstore = cursor_ctx.transaction?.objectStore(cursor_ctx.store);
    }

    if (!exists(cursor_ctx.idx) && exists(cursor_ctx.index)) {
      cursor_ctx.idx = cursor_ctx.objectstore?.index(cursor_ctx.index);
    }

    const request: IDBRequest<IDBCursorWithValue | null> | undefined = cursor_ctx.index
      ? cursor_ctx.idx?.openCursor(cursor_ctx.range, cursor_ctx.direction)
      : cursor_ctx.objectstore?.openCursor(cursor_ctx.range, cursor_ctx.direction);

    request?.transaction?.addEventListener('complete', (e) => finish(e));

    request?.transaction?.addEventListener('error', (e) => {
      cursor_ctx.error = cloneError((e as any).error);
      cursor_ctx = decorateCursor(e, cursor_ctx);
      safeApply(cursor_ctx.on_error, [cursor_ctx]);
    });

    request?.addEventListener('success', (e) => {
      cursor_ctx.cursor = request?.result;
      if (exists(cursor_ctx.cursor)) {
        cursor_ctx.primary_key = cursor_ctx.cursor.primaryKey;
        cursor_ctx.key = cursor_ctx.cursor.key;
        cursor_ctx.direction = cursor_ctx.cursor.direction;
      }
      cursor_ctx = decorateCursor(e, cursor_ctx);

      if (exists(skip)) {
        cursor_ctx.cursor?.advance(skip);
        skip = null;
      } else {
        if (!exists(limit) || count++ < limit) {
          safeApply(getRequest, [cursor_ctx]);
        }
      }
    });


    const finish = (e: Event) => {
      cursor_ctx.cursor = request?.result;
      cursor_ctx = decorateCursor(e, cursor_ctx);
      cursor_ctx.last_key = cursor_ctx.key;
      delete cursor_ctx.key;
      cursor_ctx.last_primary_key = cursor_ctx.primary_key;
      delete cursor_ctx.primary_key;
      cursor_ctx.last_entry = cursor_ctx.entry;
      delete cursor_ctx.entry;
      delete cursor_ctx.direction;

      cursor_ctx.db?.close();
      safeApply(cursor_ctx.on_success, [cursor_ctx]);
    };

  };

  const decorateCursor = (e: Event, context: DashContext): DashContext => {
    context.event = e;
    context.transaction = (context.request) ? context.request.transaction! : (e.target as IDBOpenDBRequest).transaction!;

    if (exists(context.transaction?.db)) {
      context.db = context.transaction?.db;
    }

    return context;
  };

  // Database Methods
  const databaseMethods = {
    get: function (open_ctx: DashContext) {
      const their_upgrade = open_ctx.on_upgrade_needed;
      const their_success = open_ctx.on_success;
      const their_on_blocked = open_ctx.on_blocked;
      let was_upgrade = false;

      open_ctx.request = db.open(open_ctx.database, open_ctx.version);

      open_ctx.request.addEventListener('success', (event) => {
        if (!was_upgrade) {
          open_ctx.db = (event.target as IDBOpenDBRequest).result;
          safeApply(their_success, [open_ctx]);
        }
      });

      open_ctx.request.addEventListener('upgradeneeded', (event) => {
        was_upgrade = true;
        open_ctx.db = (event.target as IDBOpenDBRequest).result;
        safeApply(their_upgrade, [open_ctx]);
      });

      open_ctx.request.addEventListener('blocked', (event) => {
        safeApply(their_on_blocked, [open_ctx]);
      });
    },

    remove: function (remove_ctx: DashContext, silent?: boolean) {
      db.deleteDatabase(remove_ctx.database);
      if (!silent) safeApply(remove_ctx.on_success, [remove_ctx]);
    },

    close: function (close_ctx: DashContext, silent?: boolean) {
      close_ctx.db?.close();
      if (!silent) safeApply(close_ctx.on_success, [close_ctx]);
    }
  };

  // Store Methods
  const storeMethods = {
    clear: function (clear_ctx: DashContext) {
      clear_ctx.objectstore?.clear();
      safeApply(clear_ctx.on_success, [clear_ctx]);
    },

    remove: function (remove_ctx: DashContext) {
      remove_ctx.db?.deleteObjectStore(remove_ctx.store);
      safeApply(remove_ctx.on_success, [remove_ctx]);
    },

    get: function (get_ctx: DashContext) {
      safeApply(get_ctx.on_success, [get_ctx]);
    }
  };

  // Index Methods
  const indexMethods = {
    get: function (get_ctx: DashContext) {
      get_ctx.idx = get_ctx.objectstore?.index(get_ctx.index);
      safeApply(get_ctx.on_success, [get_ctx]);
    },

    remove: function (remove_ctx: DashContext) {
      remove_ctx.objectstore?.deleteIndex(remove_ctx.index);
      safeApply(remove_ctx.on_success, [remove_ctx]);
    },

    getIndexes: function (get_ctx: DashContext) {
      get_ctx.indexes = get_ctx.objectstore?.indexNames;
      safeApply(get_ctx.on_success, [get_ctx]);
    }
  };

  // Entry Methods
  const entryMethods = {
    add: function (add_ctx: DashContext) {
      add_ctx.data = exists(add_ctx.data) ? clone(add_ctx.data) : add_ctx.data;
      const request = add_ctx.objectstore?.add(add_ctx.data);

      request?.addEventListener('success', () => {
        add_ctx.key = request.result;
        add_ctx.entry = add_ctx.data;
        if (add_ctx.objectstore?.keyPath) {
          add_ctx.entry[add_ctx.objectstore.keyPath[0]] = add_ctx.key;
        }
        safeApply(add_ctx.on_success, [add_ctx]);
      });

      request?.addEventListener('error', (event) => {
        add_ctx.error = cloneError((event as any).target.error);
        safeApply(add_ctx.on_error, [add_ctx]);
      });
    },

    remove: function (remove_ctx: DashContext) {
      const request = remove_ctx.objectstore?.delete(remove_ctx.key);

      remove_ctx.transaction?.addEventListener('complete', () => {
        remove_ctx.entry = request?.result;
        safeApply(remove_ctx.on_success, [remove_ctx]);
      });

      remove_ctx.transaction?.addEventListener('error', (event) => {
        remove_ctx.error = cloneError((event as any).target.error);
        safeApply(remove_ctx.on_error, [remove_ctx]);
      });
    },

    get: function (get_ctx: DashContext) {
      const request = exists(get_ctx.index)
        ? get_ctx.objectstore?.index(get_ctx.index)?.get(get_ctx.key)
        : get_ctx.objectstore?.get(get_ctx.key);

      request?.addEventListener('success', () => {
        get_ctx.entry = request.result;
        if (!get_ctx.entry) {
          get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
          safeApply(get_ctx.on_error, [get_ctx]);
        } else {
          safeApply(get_ctx.on_success, [get_ctx]);
        }
      });

      request?.addEventListener('error', (event) => {
        get_ctx.error = cloneError((event as any).target.error);
        safeApply(get_ctx.on_error, [get_ctx]);
      });
    },

    put: function (put_ctx: DashContext) {
      const request = exists(put_ctx.key)
        ? put_ctx.objectstore?.put(put_ctx.data, put_ctx.key)
        : put_ctx.objectstore?.put(put_ctx.data);

      request?.addEventListener('success', () => {
        put_ctx.key = request.result;
        put_ctx.entry = put_ctx.data;
        safeApply(put_ctx.on_success, [put_ctx]);
      });

      request?.addEventListener('error', (event) => {
        put_ctx.error = cloneError((event as any).target.error);
        safeApply(put_ctx.on_error, [put_ctx]);
      });
    }
  };

  // Full public API
  const Public = {
    database: {
      get: databaseMethods.get,
      remove: databaseMethods.remove,
      close: databaseMethods.close
    },
    store: {
      clear: storeMethods.clear,
      remove: storeMethods.remove,
      get: storeMethods.get
    },
    index: {
      get: indexMethods.get,
      remove: indexMethods.remove,
      getIndexes: indexMethods.getIndexes
    },
    entry: {
      add: entryMethods.add,
      remove: entryMethods.remove,
      get: entryMethods.get,
      put: entryMethods.put
    }
  };

  return Public;

})(self as DashEnvironment);
