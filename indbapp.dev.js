/* Begin InDBApp singleton */

var InDBApp = function( request ) {
	

	var current_database = 'InDBApp';
	var current_description = '';

	if( 'undefined' !== typeof request ) {
		if( 'undefined' !== typeof request.database ) {
			current_database = request.database;
		}

		if( 'undefined' !== typeof request.description ) {
			current_description = request.description;
		}
	}

	this.InDB = new IDB( { 'database': current_database, 'description': current_description } );
	
};

/* Not chainable */
InDBApp.prototype.shorthand = InDBApp.prototype.shorthand || {};
InDBApp.prototype.shorthand.set = function( request ) {
	return this.InDB.shorthand.set( request );
};
InDBApp.prototype.shorthand.get = function( request ) {
	return this.InDB.shorthand.get( request );
};

/* Add */
InDBApp.prototype.add = function( request ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' == typeof store || null === store ) {
		throw new Error( 'InDBApp.prototype.add: Store cannot be empty' );
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
			console.log( 'InDBApp.prototype.add success', value );
		}
		/* Callback */
		if( 'function' == typeof on_success ) {
			request.on_success( value );
		}
	};

	var on_error = function( context ) {
		/* Debug */
		if( !!N.prototype.debug ) {
			console.log( 'InDBApp.prototype.add error', context );
		}
		/* Callback */
		if( 'function' == typeof on_error ) {
			request.on_error( context );
		}
	};

	/* Request */

	this.InDB.add( {
		'data': data
		, 'on_success': on_success
		, 'on_error': on_error
		, 'store': store
	} );

	return this;

};


InDBApp.prototype.cursor = InDBApp.prototype.cursor || {};
InDBApp.prototype.cursor.get = function( request ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' === typeof store ) {
		throw new Error( 'InDBApp.prototype.cursor.get: Store must not be empty' );
	}

	/* Defaults */

	var index = request.key;
	index = ( 'undefined' !== typeof index ) ? index : null;
	var limit = request.limit;
	limit = ( 'undefined' !== typeof limit ) ? limit : 20;
	var direction = request.limit;
	direction = ( 'undefined' !== typeof direction ) ? direction : this.InDB.cursor.direction.previous();
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

	this.InDB.cursor.get( {
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

InDBApp.prototype.cursor = InDBApp.prototype.cursor || {};
InDBApp.prototype.cursor.filterGet = function( request ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' === typeof store ) {
		throw new Error( 'InDBApp.prototype.cursor.get: Store must not be empty' );
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
	direction = ( 'undefined' !== typeof direction ) ? direction : this.InDB.cursor.direction.previous();
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
			console.log( 'InDBApp.prototype.cursor.filterGet complete' );
		}
		/* Callback */
		if( 'function' == typeof on_complete ) {
			request.on_complete();
		}
	};

	var on_success = function( value ) {
		/* Debug */
		if( !!N.prototype.debug ) {
			console.log( 'InDBApp.prototype.cursor.filterGet success', value );
		}
		/* Callback */
		if( 'function' == typeof on_success ) {
			request.on_success( value );
		}
	};

	var on_error = function( context ) {
		/* Debug */
		if( !!N.prototype.debug ) {
			console.log( 'InDBApp.prototype.cursor.filterGet error', context );
		}
		/* Callback */
		if( 'function' == typeof on_error ) {
			request.on_error( context );
		}
	};

	/* Request */

	this.InDB.cursor.filterGet( {
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


InDBApp.prototype.get = function( request ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' == typeof store || null === store ) {
		throw new Error( 'InDBApp.prototype.get: Store cannot be empty' );
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

	this.InDB.get( {
		'index': index
		, 'key': key
		, 'on_success': on_success
		, 'on_error': on_error
		, 'store': store
	} );

	return this;

};


InDBApp.prototype.filterGet = function( request ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' == typeof store || null === store ) {
		throw new Error( 'InDBApp.prototype.get: Store cannot be empty' );
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

	this.InDB.filterGet( {
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

InDBApp.prototype.cursor = InDBApp.prototype.cursor || {};
InDBApp.prototype.cursor.update = function( request ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' === typeof store ) {
		throw new Error( 'InDBApp.prototype.cursor.get: Store must not be empty' );
	}

	/* Defaults */

	var index = request.key;
	index = ( 'undefined' !== typeof index ) ? index : null;
	var limit = request.limit;
	limit = ( 'undefined' !== typeof limit ) ? limit : 20;
	var direction = request.limit;
	direction = ( 'undefined' !== typeof direction ) ? direction : this.InDB.cursor.direction.previous();
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

	this.InDB.cursor.update( {
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

InDBApp.prototype.update = function( key, on_success, on_error ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' == typeof store || null === store ) {
		throw new Error( 'InDBApp.prototype.get: Store cannot be empty' );
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

	this.InDB.update( {
		'index': index
		, 'key': key
		, 'on_success': on_success
		, 'on_error': on_error
		, 'store': store
	} );

	return this;

};

InDBApp.prototype.cursor = InDBApp.prototype.cursor || {};
InDBApp.prototype.cursor.filterUpdate = function( request ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' === typeof store ) {
		throw new Error( 'InDBApp.prototype.cursor.get: Store must not be empty' );
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
	direction = ( 'undefined' !== typeof direction ) ? direction : this.InDB.cursor.direction.previous();
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

	this.InDB.cursor.filterUpdate( {
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

InDBApp.prototype.filterUpdate = function( key, on_success, on_error ) {

	/* Setup */

	var store = request.store;
	if( 'undefined' == typeof store || null === store ) {
		throw new Error( 'InDBApp.prototype.get: Store cannot be empty' );
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

	this.InDB.filterUpdate( {
		'index': index
		, 'key': key
		, 'attributes': attributes
		, 'on_success': on_success
		, 'on_error': on_error
		, 'store': store
	} );

	return this;

};

/* End InDBApp Singleton */
