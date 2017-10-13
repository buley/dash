self.dashRest = self.dashRest || (function (environment) {
  "use strict";
  var that,
  	rest = {},
	ajax = function( context ) {	
	  var request_type = context.method,
	    url = context.url,
	    input = context.data,
	    params = context.params,
	    callback = context.callback,
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
	      return queryString;
	    },
	    qs = serialize(params),
	    formencoded = serialize(input),
	    i = 0,
	    error = null;
	  if (environment.XMLHttpRequest) {
	    request = new XMLHttpRequest();
	  } else {
	    for (i = 0; i < fallbacks.length; i++) {
	      try {2
	        request = new ActiveXObject(fallbacks[i]);
	        break;
	      } catch (e) {}
	    }
	  }
	  request.addEventListener('readystatechange', function (e) {
	  	if ('function' === typeof callback && 4 === request.readyState && null !== request.status.toString().match(/^2/)) {
	  		var json;
	  		try {
	      		json = JSON.parse(request.responseText);
	  		} catch(e) {
	  			//not json (or bad json)
	  		}
	  		error = null;
		    callback(json || request.responseText, error, e, request);
	  	} else if ('function' === typeof callback && 4 === request.readyState && null !== request.status.toString().match(/^[34]/)) {
	  		var json;
	  		//TODO: Handle this
	  		try {
	      		json = JSON.parse(request.responseText);
	  		} catch(e) {
	  			//not json (or bad json)
	  		}
	  		error = request.status.toString();
		    callback(json || request.responseText, error, e, request);
	  	}
	  }, true);

	  if (request_type.toUpperCase() === 'GET') {
	    request.open(request_type, url + (qs ? '?' + qs : ''), true);
	    request.send();
	  } else {
	    request.open(request_type, url + (qs ? '?' + qs : ''), true);
	    if (false === context.json) {
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
		if ( that.contains( [ 'get.entry', 'get.entries', 'get.index', 'get.database', 'get.store' ], signature)) {
			return 'GET';
		} else if ( that.contains([ 'remove.entry', 'remove.entries', 'remove.index', 'remove.database', 'remove.store' ], signature)) {
			return 'DELETE';
		} else if ( that.contains([ 'add.entry' ], signature)) {
			return 'POST';
		} else if ( that.contains([ 'update.entry', 'update.entries' ], signature)) {
			return 'PUT';
		} else {
			return null;
		}
	},
	scripts = ( !! environment.document) ? environment.document.getElementsByTagName("script") : [],
    libraryScript = scripts[scripts.length - 1] || null,
    libraryPath =( null !== libraryScript && null === libraryScript.src.match(/chrome-extension/) ) ? libraryScript.src : null,
	workerEnvironment = null !== environment.constructor.toString().match(/WorkerGlobalScope/),
	worker,
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
              that.apply(success, [data]);
              break;
            case 'error':
              delete workQueue[data.uid];
              worker.removeEventListener('message', callback);
              that.apply(error, [data]);
              break;
            case 'abort':
              that.apply(notify, [data]);
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
	          	if(!!val) {
		            data[key] = val;
	          	}
	          });
  		  }
          return data;
        };
      that.iterate(callbacks, function (key, val) {
        delete context[key];
      });
      workRegister(worker, message, context, function (data) {
      	var add_ctx = that.clone(context);
      	add_ctx.data = data.context.entry;
      	add_ctx.resting = true;
      	that.api.add.entry(add_ctx)(function(added_ctx) {
      		delete added_ctx.resting;
	        defd.resolve(getData(added_ctx));
      	}, function(added_ctx) {
      		delete added_ctx.resting;
	        defd.reject(getData(added_ctx));
      	}, function(added_ctx) {
      		delete added_ctx.resting;
	        defd.notify(getData(added_ctx));
      	})
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
        params = context.params,
        expires = input.expires,
        end = function (ctx) {
          ctx.type = ctx.type || 'success';
          environment.postMessage(ctx);
        }, 
        callback = function(sig) {
	      	return function(data, error) {
	      		delete input.context.callback;
	      		if (!!error) {
	      			input.context.error = error;
	      			input.context.message = data;
	      			input.type = 'error';
	      		} else {
	      			input.context.entry = data;
	      		}
			    end(input);
	      	}
      	};
      if (method === 'GET' || method === 'PUT' || method === 'POST' || method === 'DELETE') {
      	context.callback = callback(method);
        if ( method === 'GET' ) {
        	get(context);
        } else if ( method === 'POST' ) {
        	post(context);
        } else if ( method === 'PUT' ) {
        	put(context);
        } else if ( method === 'DELETE' ) {
        	remove(context);
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
	return function(libraryPath) {
	  worker = !!libraryPath ? new Worker(libraryPath) : null
	  return [ function (state) {
	  	that = this;
	    if(this.isnt(state.context.rest, true) || this.exists(state.context.resting)) {
	      return state;
	    }
	    state.context.restid = this.random();
	    rest[ state.context.restid ] = {
	    	url: state.context.url,
	    	params: state.context.params ? state.context.params : null
	    }
	    delete state.context.url;
	    delete state.context.params;
	    return state;
	  }, function (state) {
	    if(this.isnt(state.context.rest, true) || this.exists(state.context.resting)) {
	      return state;
	    }
	    var promise = state.promise,
	    	outward = this.deferred(),
	    	inward,
	    	update = false,
	    	args;
	    	if (this.contains(['add.entry', 'update.entry', 'update.entries', 'remove.entry', 'remove.entries'], state.method)) {
			    if (this.contains(['notify', 'resolve'], state.type)) {
			      update = true;
			    } 
	    	} else {
	    		if ((this.is('error', state.type) || (this.isEmpty(state.context.entry) && this.contains(['get.entry', 'get.entries'], state.method))) && (this.is(state.context.rest, true) || this.is(state.context.fallback, true))) {
			      update = true;
				}
	    	}
  		    args = rest[ state.context.restid ];
	    	if (update) {
    		  state.promise = outward.promise;
    		  state.context.url = args.url;0
    		  if (that.isFunction(state.context.url)) {
    		  	state.context.url = that.apply(state.context.url, [that.clone(state)]);
    		  }
    		  if (that.isFunction(state.context.params)) {
    		  	state.context.params = that.apply(state.context.params, [that.clone(state)]);
    		  }
    		  state.context.params = args.params;
	          inward = workDispatch( whichMethod(state.method), state.context);
		  	  inward(function(ctx2){
    		    ctx2.url = args.url;
    		    ctx2.params = args.params;
    		    state.context = ctx2;
    		    state.type = 'resolve';
			    delete rest[ ctx2.restid ];
      			delete ctx2.restid;
			    outward.resolve(state.context);
		  	  }, function(ctx2) {
    		    ctx2.url = args.url;
    		    ctx2.params = args.params;
			    delete rest[ ctx2.restid ];
      			delete ctx2.restid;
    		    state.context = ctx2;
    		    state.type = 'error';
  			    outward.reject(state.context);
		  	  }, function(ctx2) {
    		    ctx2.url = args.url;
    		    ctx2.params = args.params;
			    delete rest[ ctx2.restid ];
      			delete ctx2.restid;
    		    state.type = 'notify';
    		    state.context = ctx2;
			    outward.notify(state.context);
		  	  });
	    	} else {
		      state.context.url = args.url;
		      state.context.params = args.params;
		      delete rest[ state.context.restid ];
		      delete state.context.restid;
	    	}
	    return state;
	  } ];
		};
	}
}(self));
