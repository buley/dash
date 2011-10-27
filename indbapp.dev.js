/* Begin App singleton */

var InDBApp = (function(){

	var InDB;
	var App = function( request ) {


		var current_database = 'App';
		var current_description = '';

		if( 'undefined' !== typeof request ) {
			if( 'undefined' !== typeof request.database ) {
				current_database = request.database;
			}

			if( 'undefined' !== typeof request.description ) {
				current_description = request.description;
			}
		}

		InDB = new IDB( { 'database': current_database, 'description': current_description } );
		
	};

	/* Not chainable */
	App.prototype.shorthand = App.prototype.shorthand || {};
	App.prototype.shorthand.set = function( request ) {
		return InDB.shorthand.set( request );
	};
	App.prototype.shorthand.get = function( request ) {
		return InDB.shorthand.get( request );
	};

	/* Add */
	App.prototype.add = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' == typeof store || null === store ) {
			throw new Error( 'App.prototype.add: Store cannot be empty' );
			return null;
		}

		/* Defaults */

		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;

		/* Callbacks */

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'App.prototype.add success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'App.prototype.add error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.add( {
			'data': data
			, 'on_success': on_success
			, 'on_error': on_error
			, 'store': store
		} );

		return this;

	};


	App.prototype.cursor = App.prototype.cursor || {};
	App.prototype.cursor.get = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' === typeof store ) {
			throw new Error( 'App.prototype.cursor.get: Store must not be empty' );
		}

		/* Defaults */

		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var limit = request.limit;
		limit = ( 'undefined' !== typeof limit ) ? limit : 20;
		var direction = request.limit;
		direction = ( 'undefined' !== typeof direction ) ? direction : InDB.cursor.direction.previous();
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;
		var left = request.left;
		left = ( 'undefined' !== typeof left ) ? left : 0;
		var right = request.right;
		right = ( 'undefined' !== typeof right ) ? right : null;
		var left_inclusive = request.left_inclusive;
		left_inclusive = ( 'undefined' !== typeof left_inclusive ) ? left_inclusive : true;
		var right_inclusive = request.right_inclusive;
		right_inclusive = ( 'undefined' !== typeof right_inclusive ) ? right_inclusive : null;

		/* Callbacks */

		var on_complete = function() {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get complete' );
			}
			/* Callback */
			if( 'function' == typeof on_complete ) {
				request.on_complete();
			}
		};

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.cursor.get( {
			'direction': direction
			, 'key': key
			, 'index': index
			, 'left': left
			, 'left_inclusive': left_inclusive
			, 'limit': limit
			, 'on_success': on_success
			, 'on_complete': on_complete
			, 'on_error': on_error
			, 'right': right
			, 'right_inclusive': right_inclusive
			, 'store': store
		} );

		return this;

	};

	App.prototype.cursor = App.prototype.cursor || {};
	App.prototype.cursor.filterGet = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' === typeof store ) {
			throw new Error( 'App.prototype.cursor.get: Store must not be empty' );
		}

		/* Defaults */
		var expecting = request.expecting;
		expecting = ( 'undefined' !== typeof expecting ) ? expecting : null;
		var attributes = request.attributes || request.attribute;
		attributes = ( 'undefined' !== typeof attributes ) ? attributes : null;
		var index = request.index;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var limit = request.limit;
		limit = ( 'undefined' !== typeof limit ) ? limit : 20;
		var direction = request.limit;
		direction = ( 'undefined' !== typeof direction ) ? direction : InDB.cursor.direction.previous();
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;
		var left = request.left;
		left = ( 'undefined' !== typeof left ) ? left : 0;
		var right = request.right;
		right = ( 'undefined' !== typeof right ) ? right : null;
		var left_inclusive = request.left_inclusive;
		left_inclusive = ( 'undefined' !== typeof left_inclusive ) ? left_inclusive : true;
		var right_inclusive = request.right_inclusive;
		right_inclusive = ( 'undefined' !== typeof right_inclusive ) ? right_inclusive : null;

		/* Callbacks */

		var on_complete = function() {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'App.prototype.cursor.filterGet complete' );
			}
			/* Callback */
			if( 'function' == typeof on_complete ) {
				request.on_complete();
			}
		};

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'App.prototype.cursor.filterGet success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'App.prototype.cursor.filterGet error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.cursor.filterGet( {
			'attributes': attributes
			, 'direction': direction
			, 'key': key
			, 'expecting': expecting
			, 'index': index
			, 'left': left
			, 'left_inclusive': left_inclusive
			, 'limit': limit
			, 'on_success': on_success
			, 'on_complete': on_complete
			, 'on_error': on_error
			, 'right': right
			, 'right_inclusive': right_inclusive
			, 'store': store
		} );

		return this;

	};


	App.prototype.get = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' == typeof store || null === store ) {
			throw new Error( 'App.prototype.get: Store cannot be empty' );
			return null;
		}

		/* Defaults */

		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;

		/* Callbacks */

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.get( {
			'index': index
			, 'key': key
			, 'on_success': on_success
			, 'on_error': on_error
			, 'store': store
		} );

		return this;

	};


	App.prototype.filterGet = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' == typeof store || null === store ) {
			throw new Error( 'App.prototype.get: Store cannot be empty' );
			return null;
		}

		/* Defaults */

		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;
		var expecting = request.expecting;
		expecting = ( 'undefined' !== typeof expecting ) ? expecting : null;
		var attributes = request.attributes;
		attributes = ( 'undefined' !== typeof attributes ) ? attributes: null;

		/* Callbacks */

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.filterGet( {
			'attributes': attributes
			, 'expecting': expecting
			, 'index': index
			, 'key': key
			, 'on_success': on_success
			, 'on_error': on_error
			, 'store': store
		} );

		return this;

	};

	App.prototype.cursor = App.prototype.cursor || {};
	App.prototype.cursor.update = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' === typeof store ) {
			throw new Error( 'App.prototype.cursor.get: Store must not be empty' );
		}

		/* Defaults */

		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var limit = request.limit;
		limit = ( 'undefined' !== typeof limit ) ? limit : 20;
		var direction = request.limit;
		direction = ( 'undefined' !== typeof direction ) ? direction : InDB.cursor.direction.previous();
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;
		var left = request.left;
		left = ( 'undefined' !== typeof left ) ? left : 0;
		var right = request.right;
		right = ( 'undefined' !== typeof right ) ? right : null;
		var left_inclusive = request.left_inclusive;
		left_inclusive = ( 'undefined' !== typeof left_inclusive ) ? left_inclusive : true;
		var right_inclusive = request.right_inclusive;
		right_inclusive = ( 'undefined' !== typeof right_inclusive ) ? right_inclusive : null;

		/* Callbacks */

		var on_complete = function() {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get complete' );
			}
			/* Callback */
			if( 'function' == typeof on_complete ) {
				request.on_complete();
			}
		};

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.cursor.update( {
			'left': begin
			, 'direction': direction
			, 'key': key
			, 'index': index
			, 'left': left
			, 'left_inclusive': left_inclusive
			, 'limit': limit
			, 'on_success': on_success
			, 'on_complete': on_complete
			, 'on_error': on_error
			, 'right': right
			, 'right_inclusive': right_inclusive
			, 'store': store
		} );

		return this;

	};

	App.prototype.update = function( key, on_success, on_error ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' == typeof store || null === store ) {
			throw new Error( 'App.prototype.get: Store cannot be empty' );
			return null;
		}

		/* Defaults */

		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;

		/* Callbacks */

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.update( {
			'index': index
			, 'key': key
			, 'on_success': on_success
			, 'on_error': on_error
			, 'store': store
		} );

		return this;

	};

	App.prototype.cursor = App.prototype.cursor || {};
	App.prototype.cursor.filterUpdate = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' === typeof store ) {
			throw new Error( 'App.prototype.cursor.get: Store must not be empty' );
		}

		/* Defaults */

		var expecting = request.expecting;
		expecting = ( 'undefined' !== typeof expecting ) ? expecting : null;
		var attributes = request.attributes || request.attribute;
		attributes = ( 'undefined' !== typeof attributes ) ? attributes : null;
		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var limit = request.limit;
		limit = ( 'undefined' !== typeof limit ) ? limit : 20;
		var direction = request.limit;
		direction = ( 'undefined' !== typeof direction ) ? direction : InDB.cursor.direction.previous();
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;
		var left = request.left;
		left = ( 'undefined' !== typeof left ) ? left : 0;
		var right = request.right;
		right = ( 'undefined' !== typeof right ) ? right : null;
		var left_inclusive = request.left_inclusive;
		left_inclusive = ( 'undefined' !== typeof left_inclusive ) ? left_inclusive : true;
		var right_inclusive = request.right_inclusive;
		right_inclusive = ( 'undefined' !== typeof right_inclusive ) ? right_inclusive : null;

		/* Callbacks */

		var on_complete = function() {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get complete' );
			}
			/* Callback */
			if( 'function' == typeof on_complete ) {
				request.on_complete();
			}
		};

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.cursor.filterUpdate( {
			'attributes': attributes
			, 'direction': direction
			, 'expecting': expecting
			, 'key': key
			, 'index': index
			, 'left': left
			, 'left_inclusive': left_inclusive
			, 'limit': limit
			, 'on_success': on_success
			, 'on_complete': on_complete
			, 'on_error': on_error
			, 'right': right
			, 'right_inclusive': right_inclusive
			, 'store': store
		} );

		return this;

	};

	App.prototype.filterUpdate = function( key, on_success, on_error ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' == typeof store || null === store ) {
			throw new Error( 'App.prototype.get: Store cannot be empty' );
			return null;
		}

		/* Defaults */

		var index = request.key;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;	
		var expecting = request.expecting;
		expecting = ( 'undefined' !== typeof expecting ) ? expecting : null;
		var attributes = request.attributes || request.attribute;
		attributes = ( 'undefined' !== typeof attributes ) ? attributes : null;

		/* Callbacks */

		var on_success = function( value ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get success', value );
			}
			/* Callback */
			if( 'function' == typeof on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!N.prototype.debug ) {
				console.log( 'N.prototype.synapses.get error', context );
			}
			/* Callback */
			if( 'function' == typeof on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.filterUpdate( {
			'index': index
			, 'key': key
			, 'attributes': attributes
			, 'on_success': on_success
			, 'on_error': on_error
			, 'store': store
		} );

		return this;

	};

	/* End App Singleton */

})(); // End immediately executing anonymous function
