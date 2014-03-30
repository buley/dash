self.dashCache = self.dashCache || (function (environment) {
  "use strict";
  var that,
  	cache = {},
	set = function( request ) {	
		//Prefix to help prevent namespace collisions
		var key = request.key || null
		    , value = request.value || null
		    , ttl = request.ttl || null //in seconds
		    , current_date = new Date()
		    , timestamp = ( current_date.getTime() + ( ttl * 1000 ) );
		if( 'undefined' === typeof key || null === key ) {
			return;
		}
		cache[ key ] = {
			data: value,
			expire: timestamp + ttl
		};
		return cache[ key ].data;
	},
	get = function( request ) {
		var key = request.key || '';
		if( 'undefined' === typeof key || null === key ) {
			return;
		}
		if(cache[ key ]) {
			if(cache[ key ].expire > new Date().getTime()) {
				return cache[ key ].data;
			}
			delete cache[key];
		}
		return null;
	},
	zap = function( request ) {
		var key = request.key || ''
		  , temp
		  , keys = key.split('.');
		if( 'undefined' === typeof key || null === key ) {
			return;
		}
		delete cache[ key ];
	},
	setExpires = function( request ) {
		var key = request.key || null
		    , timestamp = request.timestamp || 0;
		if( 'undefined' !== typeof cache[ key ] ) {
			cache[ key ][ 'timestamp' ] = timestamp;
		}
		return this;
	},
	getExpires = function( request ) {
		var key = request.key || null
		    , result = cache[ key ];
		if( 'undefined' !== typeof result ) {
			return result.timestamp;
		}
	},
	extendTTL = function( request ) {
		var key = request.key || null
		    , current = getExpires( { 'key': key } )
		    , timestamp = ( current + request.value );

		setExpires( { 'key': key, 'timestamp': timestamp } );
		return this;			    
	},
	shortenTTL = function( request ) {
		var key = request.key || null
		    , current = getExpires( { 'key': key } )
		    , timestamp = currrent + request.value;
		setExpires( { 'key': key, 'timestamp': timestamp } );
		return this;
	},
	isStale = function( request ) {
		var current_date = new Date()
		  , current_time = current_date.getTime()
		  , timestamp = ( 'undefined' !== typeof request && null !== request && 'undefined' !== typeof request.timestamp ) ? request.timestamp : null;
		if( 'undefined' === typeof timestamp || null === timestamp) {
			return false;
		}
		return ( 0 === timestamp && current_time < timestamp ) ? true : false;
	},
	roughObjectSize = function(tomeasure) {
	    var objectList = [],
	    	stack = [ tomeasure ], 
	    	bytes = 0,
	    	i;
	    	vlaue;
	    while ( stack.length ) {
	        value = stack.pop();
	        if ( typeof value === 'boolean' ) {
	            bytes += 4;
	        } else if ( typeof value === 'string' ) {
	            bytes += value.length * 2;
	        } else if ( typeof value === 'number' ) {
	            bytes += 8;
	        } else if ( typeof value === 'object' && objectList.indexOf( value ) === -1 ) {
	            objectList.push( value );
	            for( i in value ) {
	                stack.push( value[ i ] );
	            }
	        }
	    }
	    return bytes;
	},
	buildKey = function(key_ctx, type) {
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
              that.apply(notify, [data.context]);
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
        expires = input.expires,
        end = function (ctx) {
          input.context = ctx;
          input.type = 'success';
          environment.postMessage(input);
        };
      if (method === 'get' || method === 'set' || method === 'delete') {
        if ( method === 'get' ) {
        	end(get(input));
        } else if ( method === 'set' ) {
        	end(set(input));
        } else if ( method === 'delete' ) {
        	end(zap(input));
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
	    if(this.isEmpty(state.context.cache)) {
	      return state;
	    }
	    var promise = state.promise,
	    	outward = this.deferred(),
	    	inward,
	    	response,
	    	callbacks = {
		        on_success: state.context.on_success,
		        on_error: state.context.on_error,
		        on_abort: state.context.on_abort,
		        on_complete: state.context.on_complete,
		        on_upgrade_needed: state.context.on_upgrade_needed,
		        on_blocked: state.context.on_blocked,
		        on_close: state.context.on_close
		      }
	    if (this.contains(['get.entry'], state.method)) {
		    inward = workDispatch('get', { key: buildKey(state.context) } );
	    	state.context.cached = true;
	    	inward(function(response) {
	    		console.log('dispach relayed');
	    		state = response;
		    	state.promise = outward.promise;
		    	this.iterate(callbacks, function(key, val) {
		    		state.context[key] = val;
		    	});
		    	outward.resolve(state);
	    	});
	    	state.type = 'resolve';
	    }
	    return state;
	  }, function (state) {
	    if(!this.is(state.context.cached, true) || (this.isEmpty(state.context.cache) && this.isEmpty(state.context.purge))) {
	      return state;
	    }
	    var promise = state.promise,
	    	outward = this.deferred(),
	    	inward,
	    	response,
	    	args;
	    if (this.contains(['resolve','error'], state.type)) {
	    	state.promise = outward.promise;
	   	  args = { key: buildKey(state.context, state.type), value: state, ttl: state.context.expires || 3000 } ;
	      if ( !this.isEmpty(state.context.purge) ) {
		    inward = workDispatch('zap', args );
	      } else {
		    inward = workDispatch('set', args );
	  	  }
	  	  inward(function(ctx2){
		      outward.resolve(ctx2);
	  	  });
	  	  setTimeout(function(){
	  	  	outward.resolve(ctx2);
	  	  }, 5000);
		}
	    return state;
	  } ];
	}
}(self));
