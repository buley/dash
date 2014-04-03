self.dashFirebase = self.dashFirebase || (function (environment) {
  "use strict";
  var that,
	child = function( context ) {	
		var deferred = that.deferred();
		context.method = 'child';
		return deferred.promise;
	},
	set = function( context ) {	
		var deferred = that.deferred(),
			ref = firebase[ [context.firebase, context.database, context.store ].join('/') ].child(context.primary_key);
		context.method = 'set';
		ref.set( context.entry, function(err) {
			if(that.err, null) {
				deferred.resolve(context.entry);
			} else {
				deferred.reject(err);
			}
		} );
		return deferred.promise;
	},
	update = function( context ) {	
		var deferred = that.deferred(),
			ref = firebase[ [context.firebase, context.database, context.store ].join('/') ].child(context.primary_key);
		context.method = 'update';
		ref.update(context.entry, function() {
			if(that.err, null) {
				deferred.resolve(context.entry);
			} else {
				deferred.reject(err);
			}
		});
		return deferred.promise;
	},
	remove = function( context ) {	
		var deferred = that.deferred(),
			ref = firebase[ [context.firebase, context.database, context.store ].join('/') ].child(context.primary_key);
		context.method = 'remove';
		ref.remove(function() {
			if(that.err, null) {
				deferred.resolve(context.entry);
			} else {
				deferred.reject(err);
			}
		});
		return deferred.promise;
	},
	whichMethod = function(signature) {
		if ( that.contains( [ 'get.entry', 'get.entries', 'get.index', 'get.database', 'get.store' ], signature)) {
			return 'child';
		} else if ( that.contains([ 'remove.entry', 'remove.entries', 'remove.index', 'remove.database', 'remove.store' ], signature)) {
			return 'remove';
		} else if ( that.contains([ 'add.entry' ], signature)) {
			return 'set';
		} else if ( that.contains([ 'update.entry', 'update.entries' ], signature)) {
			return 'update';
		} else {
			return null;
		}
	},
	scripts = ( !! environment.document) ? environment.document.getElementsByTagName("script") : [],
    libraryScript = scripts[scripts.length - 1] || null,
    libraryPath =( null !== libraryScript && null === libraryScript.src.match(/chrome-extension/) ) ? libraryScript.src : null,
	workerEnvironment = null !== environment.constructor.toString().match(/WorkerGlobalScope/),
	worker = workerEnvironment ? null : new Worker(libraryPath),
	workQueue = {},
	firebases = {},
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
      	add_ctx.firebaseing = true;
      	that.api.add.entry(add_ctx)(function(added_ctx) {
      		delete added_ctx.firebaseing;
	        defd.resolve(getData(added_ctx));
      	}, function(added_ctx) {
      		delete added_ctx.firebaseing;
	        defd.reject(getData(added_ctx));
      	}, function(added_ctx) {
      		delete added_ctx.firebaseing;
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
  	importScripts('https://cdn.firebase.com/js/client/1.0.6/firebase.js');
  	console.log('firebase',Firebase);
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
  	  if ( 'undefined' === typeof firebases[input.context.firebase] ) {
  		  firebases[input.context.firebase] =  new Firebase([context.firebase, context.database, context.store ].join('/'));
  	  }
      if (that.contains[ 'set', 'update', 'remove', 'child',  ], method) {
      	context.callback = callback(method);
        if ( method === 'set' ) {
        	set(context);
        } else if ( method === 'child' ) {
        	child(context);
        } else if ( method === 'update' ) {
        	update(context);
        } else if ( method === 'remove' ) {
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
	  return [ function (state) {
	  	that = this;
	    if(this.isnt(state.context.firebase, true) || this.exists(state.context.firebaseing)) {
	      return state;
	    }
	    state.context.firebaseid = this.random();
	    firebase[ state.context.firebaseid ] = {
	    	url: state.context.url,
	    	params: state.context.params ? state.context.params : null
	    }
	    delete state.context.url;
	    delete state.context.params;
	    return state;
	  }, function (state) {
	    if(this.isnt(state.context.firebase, true) || this.exists(state.context.firebaseing)) {
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
	    		if ((this.is('error', state.type) || (this.isEmpty(state.context.entry) && this.contains(['get.entry', 'get.entries'], state.method))) && (this.is(state.context.firebase, true) || this.is(state.context.fallback, true))) {
			      update = true;
				}
	    	}
  		    args = firebase[ state.context.firebaseid ];
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
    		    state.context = ctx2;
    		    state.type = 'resolve';
			    outward.resolve(state.context);
		  	  }, function(ctx2) {
    		    state.context = ctx2;
    		    state.type = 'error';
  			    outward.reject(state.context);
		  	  }, function(ctx2) {
    		    state.type = 'notify';
    		    state.context = ctx2;
			    outward.notify(state.context);
		  	  });
	    	} else {
		      state.context.url = args.url;
		      state.context.params = args.params;
		      delete firebase[ state.context.firebaseid ];
		      delete state.context.firebaseid;
	    	}
	    return state;
	  } ];
	}
}(self));
