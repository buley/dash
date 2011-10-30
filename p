
	App.prototype.cursor = App.prototype.cursor || {};
	App.prototype.cursor.delete = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' === typeof store ) {
			throw new Error( 'App.prototype.cursor.delete: Store must not be empty' );
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
			if( !!debug ) {
				console.log( 'InDB.prototype.synapses.delete complete' );
			}
			/* Callback */
			if( 'function' == typeof request.on_complete ) {
				request.on_complete();
			}
		};

		var on_success = function( value ) {
			/* Debug */
			if( !!debug ) {
				console.log( 'InDB.prototype.synapses.delete success', value );
			}
			/* Callback */
			if( 'function' == typeof request.on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!debug ) {
				console.log( 'InDB.prototype.synapses.delete error', context );
			}
			/* Callback */
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.cursor.delete( {
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

	App.prototype.delete = function( request ) {

		/* Setup */

		var store = request.store;
		if( 'undefined' == typeof store || null === store ) {
			throw new Error( 'App.prototype.delete: Store cannot be empty' );
			return null;
		}

		/* Defaults */

		var index = request.index;
		index = ( 'undefined' !== typeof index ) ? index : null;
		var key = request.key;
		key = ( 'undefined' !== typeof key ) ? key : null;

		/* Callbacks */

		var on_success = function( value ) {
			/* Debug */
			if( !!debug ) {
				console.log( 'InDB.prototype.synapses.delete success', value );
			}
			/* Callback */
			if( 'function' == typeof request.on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			/* Debug */
			if( !!debug ) {
				console.log( 'InDB.prototype.synapses.delete error', context );
			}
			/* Callback */
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};

		/* Request */

		InDB.delete( {
			'index': index
			, 'key': key
			, 'on_success': on_success
			, 'on_error': on_error
			, 'store': store
		} );

		return this;

	};


