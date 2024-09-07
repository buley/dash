export const dashRest = (function (environment: any) {
    "use strict";

    let that: any;
    let rest: { [key: string]: any } = {};

    /**
     * Serializes an object into a query string.
     * @param data - The data to serialize.
     * @returns A query string representation of the data.
     */
    const serialize = function (data: any): string {
        let queryString = '';
        if (typeof data !== 'string') {
            for (const attr in data) {
                if (data.hasOwnProperty(attr)) {
                    queryString += `&${encodeURIComponent(attr)}=${encodeURIComponent(data[attr])}`;
                }
            }
            queryString = queryString.replace(/^&/, '');
        } else {
            queryString = data;
        }
        return queryString;
    };

    /**
     * Makes a fetch request based on the given context.
     * @param context - The request context containing method, URL, data, and other configurations.
     */
    const fetchRequest = async function (context: any): Promise<void> {
        const requestType = context.method.toUpperCase();
        const url = context.url;
        const input = context.data || {};
        const params = context.params || {};
        const callback = context.callback;

        const qs = serialize(params); // Serialize query string params
        const formencoded = serialize(input); // Serialize form data if necessary

        const fetchOptions: RequestInit = {
            method: requestType,
            headers: {},
        };

        if (requestType !== 'GET') {
            // For POST, PUT, and DELETE requests, handle form data or JSON
            if (context.json === false) {
                fetchOptions.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
                fetchOptions.body = formencoded;
            } else {
                fetchOptions.headers!['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify(input);
            }
        }

        try {
            const response = await fetch(url + (qs ? '?' + qs : ''), fetchOptions);
            const jsonResponse = await response.json().catch(() => response.text()); // Handle JSON or plain text

            if (response.ok) {
                if (typeof callback === 'function') {
                    callback(jsonResponse, null, response);
                }
            } else {
                if (typeof callback === 'function') {
                    callback(jsonResponse, response.status.toString(), response);
                }
            }
        } catch (error) {
            if (typeof callback === 'function') {
                callback(null, error, null);
            }
        }
    };

    const get = function (context: any) {
        context.method = 'GET';
        fetchRequest(context);
    };

    const post = function (context: any) {
        context.method = 'POST';
        fetchRequest(context);
    };

    const put = function (context: any) {
        context.method = 'PUT';
        fetchRequest(context);
    };

    const remove = function (context: any) {
        context.method = 'DELETE';
        fetchRequest(context);
    };

    const whichMethod = function (signature: string) {
        if (that.contains(['get.entry', 'get.entries', 'get.index', 'get.database', 'get.store'], signature)) {
            return 'GET';
        } else if (that.contains(['remove.entry', 'remove.entries', 'remove.index', 'remove.database', 'remove.store'], signature)) {
            return 'DELETE';
        } else if (that.contains(['add.entry'], signature)) {
            return 'POST';
        } else if (that.contains(['update.entry', 'update.entries'], signature)) {
            return 'PUT';
        } else {
            return null;
        }
    };

    if (true === !!environment.WorkerGlobalScope) {
        environment.addEventListener('message', function (e: MessageEvent) {
            const input = e.data;
            const context = input.context;

            if (input.method === 'GET') {
                get(context);
            } else if (input.method === 'POST') {
                post(context);
            } else if (input.method === 'PUT') {
                put(context);
            } else if (input.method === 'DELETE') {
                remove(context);
            } else {
                environment.postMessage({
                    type: 'abort',
                    context: input,
                    error: 'No such method',
                });
            }
        }, false);
    } else {
        return function (libraryPath: string) {
            let worker = !!libraryPath ? new Worker(libraryPath) : null;
            return [
                function (state: any) {
                    that = this;
                    if (this.isnt(state.context.rest, true) || this.exists(state.context.resting)) {
                        return state;
                    }
                    state.context.restid = this.random();
                    rest[state.context.restid] = {
                        url: state.context.url,
                        params: state.context.params || null,
                    };
                    delete state.context.url;
                    delete state.context.params;
                    return state;
                },
                function (state: any) {
                    if (this.isnt(state.context.rest, true) || this.exists(state.context.resting)) {
                        return state;
                    }

                    let promise = state.promise;
                    const outward = this.deferred();
                    let args = rest[state.context.restid];

                    state.promise = outward.promise;
                    state.context.url = args.url;

                    if (that.isFunction(state.context.url)) {
                        state.context.url = that.apply(state.context.url, [that.clone(state)]);
                    }

                    if (that.isFunction(state.context.params)) {
                        state.context.params = that.apply(state.context.params, [that.clone(state)]);
                    }

                    state.context.params = args.params;

                    fetchRequest(state.context)
                        .then(() => {
                            delete rest[state.context.restid];
                            delete state.context.restid;
                            outward.resolve(state.context);
                        })
                        .catch(() => {
                            delete rest[state.context.restid];
                            delete state.context.restid;
                            outward.reject(state.context);
                        });

                    return state;
                },
            ];
        };
    }
})(self);

export default dashRest;