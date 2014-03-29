window.dashCache = window.dashCache || (function (environment) {
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
		return cache[ key ].data;
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
	};
  return [ function (state) {
  	that = this;
    if(this.isEmpty(state.context.cache)) {
      return state;
    }
    var inward = state.promise,
    	outward = this.deferred(),
    	response;
    console.log('checking',state.method);
    if (this.contains(['get.entry'], state.method)) {
	    console.log("CREAM get", buildKey(state.context), response);
	    response = get( {key: buildKey(state.context) });
    	console.log('response!',response);
	    if ( this.isEmpty(response)) {
	    	state = response;
	    	state.context.cached = true;
	    }
		console.log("ALL GOOD",state);

    }
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.cache) && this.isEmpty(state.context.purge)) {
      return state;
    }
    var args =  { key: buildKey(state.context, state.type), value: state, ttl: state.context.expires || 300000 } ;
    if (this.contains(['resolve','error'], state.type)) {
      if ( !this.isEmpty(state.context.purge) ) {
      	zap(args);
      } else {
      	set(args);
  	  }
      console.log("CREAM set", buildKey(state.context), args);
    }
    return state;
  } ];
}(self));
