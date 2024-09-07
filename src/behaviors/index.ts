/**
 * Behavior methods
 * @module behaviors
 */
import { cloneError, clone, contains, exists, isEmpty, is, isnt, isArray, isBoolean, isRegEx, isFunction, isObject, isNumber, isString, safeApply, safeEach, safeIterate, randomId, DashContext, PublicAPI, DashBehaviorContext } from './../utilities';

const behaviorFilters: Array<(ctx: any) => any> = [];
const behaviorActions: Array<(ctx: any) => any> = [];
const behaviorContext: DashBehaviorContext = {
    clone,
    contains,
    exists,
    is,
    isEmpty,
    isnt,
    isArray,
    isBoolean,
    isRegEx,
    isFunction,
    isObject,
    isNumber,
    isString,
    apply: safeApply,
    each: safeEach,
    iterate: safeIterate,
    random: randomId,
    api: {} as any
};

// Methods for managing streams of deferred objects
export const behaviorMethods = {
    /**
     * Retrieves all behaviors.
     * @param getCtx The context object.
     * @returns Promise<DashContext>
     */
    get: function (getCtx: DashContext): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            try {
                getCtx.behaviors = getCtx.objectstore?.indexNames;
                safeApply(getCtx.onSuccess, [getCtx]);
                resolve(getCtx);
            } catch (error) {
                getCtx.error = cloneError(error as Error);
                safeApply(getCtx.onError, [getCtx]);
                reject(getCtx);
            }
        });
    },
    /**
     * Adds a new behavior.
     * @param influence The behavior influence, either a function or an array of functions.
     */
    add: function (influence: ((addCtx: any) => any) | [((addCtx: any) => any), ((addCtx: any) => any)]) {
        if (Array.isArray(influence)) {
            if (typeof influence[0] === 'function') {
                behaviorFilters.push(influence[0]);
            }
            if (typeof influence[1] === 'function') {
                behaviorActions.push(influence[1]);
            }
        } else if (typeof influence === 'function') {
            behaviorFilters.push(influence);
            behaviorActions.push(influence);
        }
    },
    /**
     * Removes a behavior.
     * @param processCtx The context object.
     * @param slug The slug identifier.
     * @param method The method to execute.
     * @returns Promise<DashContext>
     */
    process: function (processCtx: DashContext, slug: string, method: string): Promise<DashContext> {
        return new Promise((resolve, reject) => {
            let count = 0;
            let response: any;
            let promisesChain = Promise.resolve(processCtx); // Initial promise chain starts with the context

            // Iterate over the behavior filters and chain them
            safeEach(behaviorFilters, (filter) => {
                promisesChain = promisesChain.then((context) => {
                    response = safeApply(filter, [{ type: slug, method, context, priority: ++count }], behaviorContext);
                    return response.context || context; // Chain the next context
                });
            });

            // After all filters have been processed, resolve or reject based on the final state
            promisesChain
                .then((finalContext) => {
                    resolve(finalContext); // Resolve the final context
                })
                .catch((errorContext) => {
                    reject(errorContext); // Reject with the error context if any filter failed
                });
        });
    },
    /**
     * Applies user-defined behaviors to a context.
     * @param applyCtx The context object.
     * @param slug The slug identifier.
     * @param method The method to execute.
     * @param initialPromise The initial promise to start the chain.
     * @returns Promise<DashContext>
     */
    applyBehaviors: function (applyCtx: DashContext, slug: string, method: string, initialPromise: Promise<DashContext>): Promise<DashContext> {
        let count = 0;

        return new Promise((resolve, reject) => {
            let promisesChain = initialPromise || Promise.resolve(applyCtx); // Start the promise chain with the initial promise or the context

            // Iterate over the behavior actions and chain them using Promises
            safeEach(behaviorActions, (action) => {
                promisesChain = promisesChain.then((context) => {
                    const response = safeApply(action, [{ type: slug, method, context, priority: ++count }], behaviorContext);

                    applyCtx = response.context || applyCtx; // Update the context if it's modified
                    slug = response.type || slug;  // Update the slug if modified
                    return applyCtx;
                });
            });

            // After chaining all actions, resolve or reject based on the final context
            promisesChain
                .then((finalContext) => {
                    resolve(finalContext); // Resolve with the final context
                })
                .catch((errorContext) => {
                    reject(errorContext); // Reject with the error context if any action failed
                });
        });
    }
};

export default {
    ...behaviorMethods,
    behaviorFilters,
    behaviorActions
};
