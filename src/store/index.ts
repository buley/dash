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
    /**
     * Remove a store.
     * @param remove_ctx 
     * @returns Promise<DashContext>
     */
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
    /**
     * Get a store.
     * @param get_ctx 
     * @returns Promise<DashContext>
     */
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

// Export the store methods
export default storeMethods;