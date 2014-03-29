window.dashCache = window.dashCache || (function (environment) {
  "use strict";
	/* embedded CREAM github.com/buley/CREAM */
	var CREAM = ( function () {

		var user_data_prefix = '_$' //most regex chars are invalid but some are not (e.g. $)
		  , user_data_prefix_regex = new RegExp( '^' + user_data_prefix.replace( /(\$)/g, '\\$1' ) )
		  , cache;
		if( 'undefined' !== typeof localStorage ) {
			cache = localStorage.getItem('CREAM');
			if( 'undefined' === cache || null === cache || '' === cache ) {
				cache = {};
			} else {
				cache = JSON.parse( cache );
			}
		} else {
			cache = {};
		}

		var debug = true;

		var api = function( cache ) {
			if( cache ) {
				this.cache = preheatCache( cache );
			}
		}
		
		api.prototype.set = function( request ) {	

			//Prefix to help prevent namespace collisions
			var key = request.key || null
			    , value = request.value || null
			    , ttl = request.ttl || null //in seconds
			    , current_date = new Date()
			    , timestamp = ( current_date.getTime() + ( ttl * 1000 ) )
			    , obj = {}
			    , precount = 0
			    , attr
			    , new_obj = {}
			    , keys
			    , new_value = {};

			if( !!debug ) {
				console.log('api.prototype.set key',key,'value',value);
			}

			if( 'function' === typeof value ) {
				value = value()
			}
			
			if( hasAttributes( value ) ) {
				for( attr in value ) {
					new_value[ user_data_prefix + attr ] = value[ attr ];

				}
				value = new_value;
			}
			if( -1 !== key.indexOf( '.' ) ) {
				precount = key.split('.').length;
				while( key && -1 !== key.indexOf( '.' ) ) {
					keys = key.split( '.' );
					new_obj = {};
					key = keys.pop();
					if( 'undefined' === typeof key ) {
						break;
					}
					if( ( precount - 1 ) === keys.length ) {
						new_obj[ user_data_prefix + key ] = {
							'timestamp': timestamp
							, 'data': value
						};
					} else {
						new_obj[ user_data_prefix + key ] = {
							'timestamp': timestamp
							, 'data': obj
						};
					}
					obj = new_obj;
					key = keys.join( '.' );
				}
				new_obj = {};
				if( 'undefined' !== typeof key ) {
					new_obj[ user_data_prefix + key ] = {
						'timestamp': timestamp
						, 'data': obj
					};
				}
				obj = new_obj;
			} else {
				if( 'undefined' !== typeof key ) {
					cache[ user_data_prefix + key ] = {
						'timestamp': timestamp
						, 'data': obj
					};
				}
			}
			cache = mergeObjects( cache, obj );
			
			if( 'undefined' !== typeof localStorage ) {
				localStorage.setItem( 'CREAM', JSON.stringify( cache ) );
			}

			return this;
		};

		api.prototype.get = function( request ) {

			var key = request.key || null
			  , result
			  , temp
			  , temp_key
			  , item
			  , keys = []
			  , res = {};

			if( 'undefined' === typeof key || null === key ) {
				return;
			}

			if( !!debug ) {
				console.log('api.prototype.get key', key ); 
			}

			if( -1 !== key.indexOf( '.' ) ) {
				temp = cache;
				keys = key.split( '.' );
				while( keys.length > 0 ) {
					key = keys.shift();
					temp_key = temp[ user_data_prefix + key ];
					if( 'undefined' !== typeof temp && 'undefined' !== typeof temp_key ) {	
						res = temp_key;
						if( 'undefined' !== typeof res && 'undefined' !== typeof res[ 'data' ] ) {
							temp = res[ 'data' ];
						} else {
							temp = res;
						}
					}
				}
				item = temp[ user_data_prefix + key ];
				if( 'undefined' !== typeof item ) {
					result = item;
				}
			} else {
				item = cache[ user_data_prefix + key ];
				if( 'undefined' !== typeof item ) {
					result = item;
				}
			}
			return filterOutput( key, result );
		};

		api.prototype.delete = function( request ) {

			var key = request.key || null
			  , temp
			  , keys = [];

			if( -1 !== key.indexOf( '.' ) ) {

				while( key && -1 !== key.indexOf( '.' ) ) {
			
					keys = key.split( '.' );
					key = keys.shift();

					if( 'undefined' !== typeof cached ) { 
						var cached = cached[ user_data_prefix + key ];
						if( 'undefined' !== typeof cached && 'undefined' !== typeof cached.data ) {
							delete cache[ user_data_prefix + key ];
						}

					}
					key = keys.join( '.' );

			
				}

			} else {

				delete cache[ key ];

			}

			return this;

		};

		api.prototype.pop = function( request ) {

			request.value = function( previous ) {
				return updateAndReturn( request.key, previous.pop() );
			};

			api.prototype.update( request );

			return this;

		};

		api.prototype.head = function( request ) {

			request.value = function( previous ) {
				return updateAndReturn( request.key, previous.shift() );
			};

			api.prototype.update( request );

			return this;

		};


		api.prototype.slice = function( request ) {

			request.value = function( previous ) {
				return updateAndReturn( request.key, previous.slice( request.begin, request.end ) );
			};

			api.prototype.update( request );

			return this;
		};

		// key, property
		api.prototype.remove = function( request ) {

			request.value = function( previous ) {
				delete previous[ request.property ] 
				return updateAndReturn( request.key, previous );
			};

			return api.prototype.update( request );
			
			return this;

		};

		api.prototype.prepend = function( request ) {

			request.value = function( previous ) {
				var value = request.value;
				if( 'string' === typeof previous ) {
					previous = value + previous;
				} else {
					previous.unshift( request.value );
				}
				return updateAndReturn( request.key, previous );
			};

			api.prototype.update( request );

			return this;

		};

		api.prototype.append = function( request ) {

			request.value = function( previous ) {
				var value = request.value;
				if( 'string' === typeof previous ) {
					previous = previous + value;
				} else {
					previous.push( request.value );
				}

				return updateAndReturn( request.key, previous );
			};

			api.prototype.update( request );

			return this;

		};

		api.prototype.increment = function( request ) {

			request.value = function( previous ) {
				previous += request.value;
				return updateAndReturn( request.key, previous );
			};

			api.prototype.update( request );

			return this;

		};

		api.prototype.update = function( request ) {

			var key = request.key || null
			  , value = request.value || null;

			var previous = api.prototype.get( key );

			if( 'function' === typeof value ) {
				value = value( previous );
			}

			cache[ key ] = {
				'timestamp': api.prototype.getExpires( { 'key': key } )
				, 'data': value
			};

			return this;

		};

		api.prototype.setExpires = function( request ) {

			var key = request.key || null
			    , timestamp = request.timestamp || 0;

			if( 'undefined' !== typeof cache[ key ] ) {
				cache[ key ][ 'timestamp' ] = timestamp;
			}

			return this;
		};


		api.prototype.getExpires = function( request ) {

			var key = request.key || null
			    , result = cache[ key ];

			if( 'undefined' !== typeof result ) {
				return result.timestamp;
			}
		
		};

		api.prototype.extendTTL = function( request ) {

			var key = request.key || null
			    , current = api.prototype.getExpires( { 'key': key } )
			    , timestamp = ( current + request.value );

			api.prototype.setExpires( { 'key': key, 'timestamp': timestamp } );

			return this;			    

		};

		api.prototype.shortenTTL = function( request ) {

			var key = request.key || null
			    , current = api.prototype.getExpires( { 'key': key } )
			    , timestamp = currrent + request.value;
			
			api.prototype.setExpires( { 'key': key, 'timestamp': timestamp } );

			return this;

		};

		api.prototype.increment = function( request ) {

			request.value = function( previous ) {
				previous += request.value;
				return updateAndReturn( request.key, previous );
			};

			api.prototype.update( request );

			return this;

		};

		var hasAttributes = function( question ) {

			var question_type = typeof question, attr;

			if( 'undefined' === question_type || 'string' === question_type || 'number' === question_type ) {
				return false;
			}

			for( attr in question ) {
				if( question.hasOwnProperty( attr ) ) {
					return true;
					break;
				}
			}

			return false;

		};

		var preheat = function( incoming, ttl ) {
		
			if( 'undefined' === typeof incoming ) {
				throw Error( 'The oven can\'t be empty.' );
			}
			var outgoing = {}
			  , item = {}
			  , current_date = new Date()
			  , ttl = ( 'number' === typeof ttl ) ? ttl : 0
			  , item_timestamp = ( 0 === ttl ) ? 0 : current_date.getTime() + ttl;
			
			for( attr in incoming ) {
				item = incoming[ '__' + attr ];
				if( incoming.hasOwnProperty( '__' + attr ) ) {
					if( true === hasAttributes( item ) ) {
						outgoing[ '__' + attr ] = preheat( incoming, ttl );	
					}	
				} else {
					outgoing[ '__' + attr ] = {
						'data': item
						, 'timestamp': item_timestamp	
					};
				}
			}
			
			return outgoing;
		};

		var updateAndReturn = function( request ) {
			var key = request.key || null
			  , value = request.value || null
			  , timestamp = getExpires( { 'key': key } );

			api.prototype.update( { 'key': key, 'value': value, 'timestamp': timestamp } );
			
			return value;
		};

		var isStale = function( request ) {
			var current_date = new Date()
			  , current_time = current_date.getTime()
			  , timestamp = ( 'undefined' !== typeof request && null !== request && 'undefined' !== typeof request.timestamp ) ? request.timestamp : null;
			if( 'undefined' === typeof timestamp || null === timestamp) {
				return false;
			}
			return ( 0 === timestamp && current_time < timestamp ) ? true : false;
		}

		var prepResults = function( incoming, stale_ok ) {
			
			var result = {}
			  , stale_ok = ( 'undefined' !== stale_ok && null !== stale_ok ) ? stale_ok : false
			  , attr;

			if( false === hasAttributes( incoming ) ) {
				return incoming;
			}
			
			for( attr in incoming ) {
				if( incoming.hasOwnProperty( attr ) ) {
					var data = incoming[ attr ];
					if( !isStale( data ) || true === stale_ok ) {
						result[ attr.replace( user_data_prefix_regex, '' ) ] = ( 'undefined' !== typeof data.data ) ? prepResults( data.data, stale_ok ) : data;
					} else {
						delete result[ attr ];
					}
				}
			}

			return result;
		};

		var filterOutput = function( key, request ) {
		
			var timestamp = ( 'undefined' !== typeof request && 'undefined' !== typeof request.timestamp ) ? parseInt( request.timestamp, 10 ) : 0
			   , data = ( 'undefined' !== typeof request ) ? request.data : null
			   , stale = isStale( data );
		
			if( true === stale ) {
				api.prototype['delete']( { 'key': key } );
			}

			return prepResults( data );

		};

		var mergeObjects = function( obj1, obj2 ) {
			if( 'undefined' === typeof obj1 ) {
				obj1 = {};
			}
			if( 'undefined' === typeof obj2 ) {
				obj2 = {};
			}
			var obj3 = {}
			  , attr = '';
			if ( false === hasAttributes( obj2 ) ) {
				return obj1;
			}
			if ( false === hasAttributes( obj1 ) ) {
				return obj2;
			}	
			for( attr in obj1 ) {
				if( obj1.hasOwnProperty( attr ) ) {
					var next = obj1[ attr ];
					if( 'undefined' !== typeof next && hasAttributes( next ) ) {
						obj3[ attr ] = mergeObjects( obj3[ attr ], next );
					} else {
						obj3[ attr ] = next;
					}
				}
			}
			for( attr in obj2 ) {
				if( obj2.hasOwnProperty( attr ) ) {
					var next = obj2[ attr ];
					if( 'undefined' !== typeof next && hasAttributes( next ) ) {
						obj3[ attr ] = mergeObjects( obj3[ attr ], next );
					} else {
						obj3[ attr ] = next;
					}
				}
			}
			return obj3;
		}
	
		var roughObjectSize = function() {
		    var objectList = [],
		    	stack = [ object ], 
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
		};
		
		return api;

	})(),
	cream = new CREAM(),
	buildKey = function(key_ctx, type) {
		var key = [ key_ctx.database, key_ctx.store, key_ctx.index, key_ctx.key, key_ctx.primary_key ].reduce(function(acc, current){
			acc = acc || [];
			if(!!current) {
				acc = [ acc, current ].join('.');
			}
			return acc;
		});
		return key;
	};
  return [ function (state) {
    if(this.isEmpty(state.context.cache)) {
      return state;
    }
    var inward = state.promise,
    	outward = this.deferred(),
    	response;
    console.log('checking',state.method);
    if (this.contains(['get.entry'], state.method)) {
      	response = cream.get( { key: buildKey(state.context, state.type) } );
	    console.log("CREAM get", buildKey(state.context), response);
    	console.log('response!',response);
    	state.context.cached = !!response ? response : null;
    	if (!!response) {
	    	state.type = 'resolve';
    		console.log("ALL GOOD",response);
	    	inward(function(ctx) {
		      outward.resolve(ctx);
		    }, function(ctx) {
		      outward.error(ctx);
		    }, function(ctx) {
		      outward.notify(ctx);
		    });    		
	    	state.promise = outward.promise;
    	}

    }
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.cache) && this.isEmpty(state.context.purge)) {
      return state;
    }
    var args =  { key: buildKey(state.context, state.type), value: state, ttl: state.context.expires || 300000 } ;
    if (this.contains(['resolve','error'], state.type)) {
      if ( this.isEmpty(state.context.purge) ) {
      	cream['delete'](args);
      } else {
      	cream.set(args);
  	  }
      console.log("CREAM set", buildKey(state.context), args);
    }
    return state;
  } ];
}(self));
