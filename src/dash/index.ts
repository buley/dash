
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
  const libraryPath = libraryScript?.src.match(/chrome-extension/) ? null : libraryScript?.src.replace(/dash.*$/, "");

  function cloneError(err: Error): Error {
    const clone = new Error(err.message);
    clone.name = err.name;
    return clone;
  }

  function safeApply(callback: Function | undefined, args: any[]): void {
    if (typeof callback === 'function') {
      try {
        callback(...args);
      } catch (error) {
        console.error(error);
      }
    }
  }

  function exists(value: any): boolean {
    return value !== undefined && value !== null;
  }
  const databaseMethods = {
    get: (db_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        if (undefined !== db_ctx.transaction) {
          const request = db_ctx.db?.transaction(db_ctx.objectstore?.name?.toString() ?? '')?.objectStore(db_ctx.objectstore?.name?.toString() ?? '')?.get(db_ctx.key);

          request?.addEventListener('success', () => {
            db_ctx.entry = request.result;
            resolve(db_ctx);
          });
    
          request?.addEventListener('error', (event) => {
            db_ctx.error = cloneError((event as any).target.error);
            reject(db_ctx);
          });
        }
  
      });
    },
    remove: (remove_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        const request = remove_ctx.objectstore?.delete(remove_ctx.key);
  
        request?.addEventListener('success', () => {
          resolve(remove_ctx);
        });
  
        request?.addEventListener('error', (event) => {
          remove_ctx.error = cloneError((event as any).target.error);
          reject(remove_ctx);
        });
      });
    },
    close: (close_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        if (close_ctx.db) {
          close_ctx.db.close();
          resolve(close_ctx);
        } else {
          reject(new Error('No database connection to close.'));
        }
      });
    }
  };
  
  const storeMethods = {
    clear: (clear_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        const request: IDBRequest<any> | undefined = clear_ctx.objectstore?.clear();

        request?.addEventListener('success', () => {
          resolve(clear_ctx);
        });

        request?.addEventListener('error', (event) => {
          clear_ctx.error = cloneError((event as any).target.error);
          reject(clear_ctx);
        });
      });
    },
    remove: (remove_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        const request: IDBRequest<any> | undefined = remove_ctx.objectstore?.delete(remove_ctx.key);

        request?.addEventListener('success', () => {
          resolve(remove_ctx);
        });

        request?.addEventListener('error', (event) => {
          remove_ctx.error = cloneError((event as any).target.error);
          reject(remove_ctx);
        });
      });
    },
    get: (get_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        const request: IDBRequest<any> | undefined = exists(get_ctx.index)
          ? get_ctx.objectstore?.index(get_ctx.index)?.get(get_ctx.key) as IDBRequest<any>
          : get_ctx.objectstore?.get(get_ctx.key) as IDBRequest<any>;

        (request as IDBRequest<any> | undefined)?.addEventListener('success', () => {
          get_ctx.entry = request.result;
          if (!get_ctx.entry) {
            get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
            reject(get_ctx);
          } else {
            resolve(get_ctx);
          }
        });

        (request as IDBRequest<any>)?.addEventListener('error', (event) => {
          get_ctx.error = cloneError((event as any).target.error);
          reject(get_ctx);
        });
      });
    }
  };

  const indexMethods = {
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
    remove: (remove_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        remove_ctx.objectstore?.deleteIndex(remove_ctx.key);
        // TODO: Add event listener for success/error
        resolve(remove_ctx);
      });
    },
    getIndexes: (ctx: DashContext) => {
      return new Promise((resolve) => {
        const indexes = ctx.objectstore?.indexNames;
        ctx.indexes = Array.from(indexes || []);
        resolve(ctx);
      });
    }
  };

  const entryMethods = {
    get: (get_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        const request = exists(get_ctx.index)
          ? get_ctx.objectstore?.index(get_ctx.index)?.get(get_ctx.key)
          : get_ctx.objectstore?.get(get_ctx.key);

        request?.addEventListener('success', () => {
          get_ctx.entry = request.result;
          if (!get_ctx.entry) {
            get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
            reject(get_ctx);
          } else {
            resolve(get_ctx);
          }
        });

        request?.addEventListener('error', (event) => {
          get_ctx.error = cloneError((event as any).target.error);
          reject(get_ctx);
        });
      });
    },
    put: (put_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        const request = exists(put_ctx.key)
          ? put_ctx.objectstore?.put(put_ctx.data, put_ctx.key)
          : put_ctx.objectstore?.put(put_ctx.data);

        request?.addEventListener('success', () => {
          put_ctx.key = request.result;
          put_ctx.entry = put_ctx.data;
          resolve(put_ctx);
        });

        request?.addEventListener('error', (event) => {
          put_ctx.error = cloneError((event as any).target.error);
          reject(put_ctx);
        });
      });
    },
    remove: (remove_ctx: DashContext) => {
      return new Promise((resolve, reject) => {
        const request = remove_ctx.objectstore?.delete(remove_ctx.key);

        request?.addEventListener('success', () => {
          resolve(remove_ctx);
        });

        request?.addEventListener('error', (event) => {
          remove_ctx.error = cloneError((event as any).target.error);
          reject(remove_ctx);
        });
      });
    }
  };

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
      get: entryMethods.get,
      put: entryMethods.put,
      remove: entryMethods.remove
    }
  };

  return Public;

})(self as DashEnvironment);