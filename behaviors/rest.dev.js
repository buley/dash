self.dashRest = self.dashRest || (function (environment) {
  "use strict";
  var that,
  	rest = {},
	ajax = function( request ) {	
	  var request_type = request.method,
	    url = request.url,
	    input = request.data,
	    params = request.params,
	    callback = request.callback,
	  	fallbacks = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'],
	    request,
	    serialize = function (data) {
	      var queryString = '',
	      	attr;
	      if ('string' !== typeof data) {
	        for (attr in data) {
	          if (data.hasOwnProperty(attr)) {
	            queryString += "&" + encodeURIComponent(attr) + '=' + encodeURIComponent(data[attr]);
	          }
	        }
	        queryString = queryString.replace(/^&/, '');
	      } else {
	        queryString = data;
	      }
	    },
	    qs = serialize(params),
	    formencoded = serialize(input),
	    i = 0;
	  
	  if (environment.XMLHttpRequest) {
	    request = new XMLHttpRequest();
	  } else {
	    for (i = 0; i < fallbacks.length; i++) {
	      try {
	        request = new ActiveXObject(fallbacks[i]);
	        break;
	      } catch (e) {}
	    }
	  }
	  request.addEventListener('readystatechange', function (e) {
	  	if ('function' === typeof callback) {
		    callback(request, e);
	  	}
	  }, true);

	  if (request_type.toUpperCase() === 'GET') {
	    request.open(request_type, url + '?' + qs, true);
	    request.send();
	  } else if (request_type.toUpperCase() === 'POST') {
	    request.open(request_type, url + '?' + qs, true);
	    if (that.is(request.json, false)) {
		    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		    request.send(formencoded);
	    } else {
		    request.setRequestHeader('Content-Type', 'application/javascript');
	    	request.send(JSON.stringify(input));
	    }
	  }

	},
	get = function( context ) {	
		context.method = 'GET';
		ajax(context);
	},
	post = function( context ) {	
		context.method = 'POST';
		ajax(context);
	},
	put = function( context ) {	
		context.method = 'PUT';
		ajax(context);
	},
	remove = function( context ) {	
		context.method = 'DELETE';
		ajax(context);
	},
	whichMethod = function(signature) {
		if ( that.contains[ 'get.entry', 'get.entries', 'get.index', 'get.database', 'get.store' ], signature) {
			return 'GET';
		} else if ( that.contains[ 'remove.entry', 'remove.entries', 'remove.index', 'remove.database', 'remove.store' ], signature) {
			return 'DELETE';
		} else if ( that.contains[ 'add.entry' ], signature) {
			return 'POST';
		} else if ( that.contains[ 'update.entry', 'update.entries' ], signature) {
			return 'PUT';
		} else {
			return null;
		}
	},
	buildUri = function(key_ctx, type) {
		var key = [ key_ctx.database, key_ctx.store, key_ctx.index, key_ctx.key, key_ctx.primary_key, key_ctx.limit ].reduce(function(acc, current){
			acc = acc || [];
			if(!!current) {
				acc = [ acc, current ].join('.');
			}
			return acc;
		});
		return key;
	},
	scripts = ( !! environment.document) ? environment.document.getElementsByTagName("script") : [],
    libraryScript = scripts[scripts.length - 1] || null,
    libraryPath =( null !== libraryScript && null === libraryScript.src.match(/chrome-extension/) ) ? libraryScript.src : null,
	workerEnvironment = null !== environment.constructor.toString().match(/WorkerGlobalScope/),
	worker = workerEnvironment ? null : new Worker(libraryPath),
	workQueue = {},
    workRegister = function (worker, message, context, success, error, notify) {
      var id = that.random(),
        callback = function (e) {
          var data = e.data,
            queued = workQueue[data.uid];
          if (undefined !== queued) {
            switch (e.data.type) {
            case 'success':
              delete workQueue[data.uid];
              worker.removeEventListener('message', callback);
              that.apply(success, [data.context]);
              break;
            case 'error':
              delete workQueue[data.uid];
              worker.removeEventListener('message', callback);
              that.apply(error, [data.context]);
              break;
            case 'abort':
              that.apply(
              	notify, [data.context]);
              break;
            default:
              break;
            }
          }
        },
        clean = function(obj) {
          if (that.isFunction(obj)) { 
            return undefined;
          } else if (that.isObject(obj)) {
            that.iterate(obj, function(key, val) {
              obj[ key ] = clean(val);
            });
          } else if (that.isArray(obj)) {
            that.each(obj, function(v, i) {
              obj[i] = clean(v);
            });
          }
          return obj;          
        };
      workQueue[id] = {
        success: success,
        error: error,
        notify: notify
      };
      worker.addEventListener('message', callback);
      worker.postMessage({
        method: message,
        context: clean(context),
        uid: id
      });
      return id;
    },
    workDispatch = function (message, context) {
      var defd = that.deferred(),
        callbacks = {
          on_success: context.on_success,
          on_error: context.on_error,
          on_abort: context.on_abort,
          on_complete: context.on_complete,
          on_upgrade_needed: context.on_upgrade_needed,
          on_blocked: context.on_blocked,
          on_close: context.on_close
        },
        getData = function (data) {
          if( that.isObject(data) )  {
	          that.iterate(callbacks, function (key, val) {
	            data[key] = val;
	          });
  		  }
          return data;
        };
      that.iterate(callbacks, function (key, val) {
        delete context[key];
      });
      workRegister(worker, message, context, function (data) {
        defd.resolve(getData(data));
      }, function (data) {
        defd.reject(getData(data));
      }, function (data) {
        defd.notify(getData(data));
      });
      return defd.promise;
    };

  if (true === workerEnvironment) {
    environment.addEventListener('message', function (e) {
      var input = e.data,
        method = input.method,
        value = input.value,
        key = input.key,
        context = input.context,
        expires = input.expires,
        end = function (ctx) {
          input.context = ctx;
          input.type = 'success';
          environment.postMessage(input);
        }, 
        callback = function(sig) {
	      	return function(data) {
	      		console.log('sig',sig,'d',data);
	      	}
      	};
      if (method === 'GET' || method === 'PUT' || method === 'POST' || method === 'DELETE') {
      	context.callback = callback(method);
        if ( method === 'GET' ) {
        	end(get(context));
        } else if ( method === 'POST' ) {
        	end(post(context));
        } else if ( method === 'PUT' ) {
        	end(put(context));
        } else if ( method === 'DELETE' ) {
        	end(remove(context));
        }
      } else {
        input.type = 'error';
        end({
          type: 'abort',
          context: input,
          error: 'No such method'
        });
      }
    }, false);
  } else {
	  return [ function (state) {
	  	that = this;
	    if(this.isEmpty(state.context.rest)) {
	      return state;
	    }
	    state.context.restid = this.random();
	    rest[ state.context.restid ] = {
	    	url: state.context.url
	    }
	    delete state.context.url;
	    return state;
	  }, function (state) {
	    if(this.is(state.context.restd, true) || this.is(state.context.rest, false)) {
	      return state;
	    }
	    var promise = state.promise,
	    	outward = this.deferred(),
	    	inward,
	    	update = false,
	    	args;
	    	if (this.contains(['add.entry', 'update.entry', 'update.entries', 'remove.entry', 'remove.entries'], state.method)) {
			    if (this.contains(['notify', 'success'], state.type)) {
			      update = true;
			    } 
	    	} else {
	    		if ((this.is('error', state.type) || (this.isEmpty(state.context.entry) && this.contains(['get.entry', 'get.entries'], state.method))) && (this.is(state.context.rest, true) || this.is(state.context.fallback, true))) {
			      update = true;
				}
	    	}
	    	if (update) {
    		  state.promise = outward.promise;
    		  args = rest[ state.context.restid ];
	    	  args.data = state.context.entry ? state.context.entry : null;
	    	  args.params = state.context.params ? state.context.params : null;
	          inward = workDispatch( whichMethod(state.method), args);
		  	  inward(function(ctx2){
			    outward.resolve(ctx2);
		  	  });
	    	}
	    return state;
	  } ];
	}
}(self));
