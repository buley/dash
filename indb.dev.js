/**
 * IndexedDB by Taylor Buley
 * Github -> http://github.com/editor/indb 
 * Twitter -> @taylorbuley
 **/

var IDB = (function(){

	/* Private vars */

	var shorthand_maps = {};
	var default_database = '';

	/* PRIVATE API */

	/**
	 * Namespaces:
	 *   DB - application namespace
	 *   DB.db - namespace for the open IndexedDB instance (IDBFactory)
	 *   DB.dbs = namespace for open databases (reserved)
	 *   DB.database - namepspace for database methods (IDBDatabase)
	 *   DB.store - namespace for operations against multiple object stores (IBObjectStore)
	 *   DB.stores - namespace for single object stores (IDBObjectStore)
	 *   DB.index - namespace for index methods (IDBIndex)
	 *   DB.transaction - namespace for key range methods (IDBTransaction)
	 *   DB.range - namespace for key range methods (IDBKeyRange)
	 *   DB.row - namespace for row methods
	 *   DB.shorthand - namespace for shorthand methods
	 *   DB.cursor - namespace for rows methods (IDBCursor)
	 *   DB.event - namespace for event and error methods (IDBEvent, IDBSuccessEvent, IDBErrorEvent, IDBDatabaseError and IDBDatabaseException)
	 *   DB.events - namespace for event callbacks
	 **/

	/* Begin Namespaces */
	var DB = {};
	DB.factory = {};
	DB.db = {};
	DB.dbs = {};
	DB.database = {};
	DB.store = {};
	DB.shorthand = {};
	DB.stores = {};
	DB.index = {};
	DB.indexes = {};
	DB.range = {};
	DB.row = {};
	DB.cursor = {};
	DB.event = {};
	DB.events = {};
	DB.transaction = {};
	DB.utilities = {};
	/* End Namespaces */


	/**
	 * Constants:
	 *   None
	 **/

	/* Begin Constants */
	/* End Constants */


	/**
	 * Defaults:
	 *   DB.database.version (int) - database version to start with
	 *   DB.debug (bool) - whether or not to console.log stuff
	 *   DB.events.on_success (function) - generic success callback
	 *   DB.events.onComplete (function) - generic complete callback
	 *   DB.events.onError (function)- generic error callback
	 *   DB.events.onAbort (function) - generic abort callback
	 */

	/* Begin Defaults */

	DB.database.version = 1;

	DB.debug = false;

	DB.events.onComplete = function ( e ) {
		if ( !!DB.debug ) {
			console.log ( "IndexedDB request completed", e );
		}
	};

	DB.events.onSuccess = function ( e ) {
		if ( !!DB.debug ) {
			console.log ( "IndexedDB request successful", e );
		}
	};

	DB.events.onError = function ( e ) {
		if ( !!DB.debug ) {
			console.log ( "IndexedDB request errored", e );
		}
	};

	DB.events.onAbort = function ( e ) {
		if ( !!DB.debug ) {
			console.log ( "IndexedDB request aborted", e );
		}
	};

	DB.events.onBlocked = function ( e ) {
		if ( !!DB.debug ) {
			console.log ( "IndexedDB request blocked", e.event.target.result );
		}
	};

	/* End Defaults */

	/* Begin Onload */
	//jQuery document.load callback TK
	/* End Onload */

	/* Shorthand */

	//global that stores the maps for various dbs
	var shorthand_maps = {};

	DB.shorthand.map = DB.shorthand.map || {};

	// Private object setter
	DB.shorthand.map.set = function( request ) {
		var on_error = request.on_error;
		var on_success = request.on_success;
		if( 'undefined' === shorthand_maps ) {
			if( 'function' === typeof on_error ) {
				on_error( new Error('Internal configuration error: no shorthand_maps' ) );
			}		
			return this;
		}
		if( 'undefined' == shorthand_maps[ request.store ] ) {
			shorthand_maps[ request.store ] = {};
		} 

		// Private object shorthand_maps
		shorthand_maps[ request.store ] = request.data;

		if( 'undefined' == typeof result ) {
			result = null;
		}
		if( 'function' === typeof on_success ) {
			on_success( result );
		}
		return this;
	};

	// Private object getter
	DB.shorthand.map.get = function( store ) {
		if( 'undefined' == shorthand_maps ) return null;
		var result = shorthand_maps[ store ]; 
		return ( 'undefined' == typeof result ) ? null : result;
	};

	DB.shorthand.get = function ( request ) {
		var shorthand_map = DB.shorthand.map.get( request.store );
		if( 'undefined' !== typeofIndexedDB.prototype.shorthand_map[ key ] ) {
			return shorthand_map[ request.key ];
		} else {
			return key;
		}
	};


	DB.shorthand.reverse = function ( request ) {
		var k = request.key;
		var reversed = {};
		var shorthand_map = DB.shorthand.map.get( request.databaes );
		for( var item in shorthand_map ) {
			if( shorthand_map.hasOwnProperty( item ) ) {
				reversed[ DB.shorthand.get( item ) ] = item;
			}
		}
		if( 'undefined' !== typeof reversed[ k ] ) {
			return reversed[ k ];
		} else {
			return k;
		}
	};


//recursive
	DB.shorthand.decode = function( object ) {
		var encoded = {};
		var total = 0;
		var object = request.data;
		for( var itemobj in object ) {
			if( 'undefined' !== typeof itemobj && object.hasOwnProperty( itemobj ) ) {
				//recursive case: object value
				//base case: string value
				var value = object[ itemobj ];
				if( 'object' === typeof value ) {
					encoded[ DB.shorthand.reverse( itemobj ) ] = DB.shorthand.decode( { 'database': request.database, 'data': value } );
					delete value;
				} else { 
					encoded[ DB.shorthand.reverse( itemobj ) ] = value;
					delete value;
				}
			}
			total++;
		}
		if( total > 0 ) {
			return encoded;
		} else {
			return {};
		}
	}


	//recursive
	DB.shorthand.encode = function( request ) {
		var encoded = {};
		var object = request.data;
		for( var item in object ) {
			if( object.hasOwnProperty( item ) ) {
				//recursive case: object value
				//base case: string value

				if( 'object' === typeof object[ item ] ) {
					encoded[ DB.shorthand.get( item ) ] = DB.shorthand.encode( { 'database': request.database, 'data': object[ item ] } );	
				} else { 
					encoded[ DB.shorthand.get( item ) ] = object[ item ];
				}
			}
		}
		return encoded;
	}




	/**
	 * Actions:
	 *  IndexedDB_database_loaded - The database is loaded into the DB.db namespace; no guarantee that object stores exist if a fresh install
	 *  IndexedDB_database_created - Database is created for the first time
	 *  IndexedDB_stores_load_{success|error|abort} - Database is loaded and all collections have been created
	 *  IndexedDB_store_created_{success|error|abort} - Response to an attempt at creating an object store
	 *  IndexedDB_database_already_loaded - a specific type of IndexedDB_database_load_error
	 *  IndexedDB_store_already_exists - a specific type of IndexedDB_store_created_error
	 **/
	 /* End Actions */

	/* Begin Functions */

	/* Begin Event Methods */

	/* binds a callback method to new events */
	DB.bind = function ( event_name, callback_method ) {
		//TODO: assert argument types and validity
		jQuery( IndexedDB ).bind( event_name, callback_method );
	}

	/* triggers a new event */
	DB.trigger = function ( event_name, context ) {
		//TODO: assert argument types and validity
		jQuery( IndexedDB ).trigger( event_name, context );
	}


	/* Begin IndexedDB Methods */
	/**
	 * DB.browserSupported( )  > support level (int): [ -1, 0, 1 ]
	 *  Checks to see if IndexedDB is supported
	 *  returns 1 if fully supported, 0 if supported w/fixes, and -1 if unsupported
	 **/

	/* Create object stores after the database is created */
	DB.bind( 'IndexedDB_do_database_load', function ( event, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_database_load', event, context );
		}

		/* Setup */

		var name = context.name;
		var description = context.description;
		var on_success = context.on_success;
		var on_error = context.on_error;
		var on_abort = context.on_abort;

		/* Assertions */

		// Assert that the database has a name
		if ( !DB.assert( !DB.isEmpty( name ), 'Database must have a name' ) ) {
			return;
		}

		/* Request */

		DB.database.load( name, description, on_success, on_error, on_abort );

	} );


	/* This function is indempodent (you can run it multiple times and it won't do anything */
	DB.database.load = function ( name, description, on_success, on_error, on_abort ) {

		/* Begin Debug */
		if ( !!DB.debug ) {
			console.log ( "DB.database.load", name, description, on_success, on_error, on_abort );
		}
		/* End Debug */

		var context = { "name": name, "description": description, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };


		/* Assertions */	
		
		if ( "IDBDatabase" === typeof DB.db && name === DB.db.name ) {
			on_error( new Error( "Database already loaded" ) );
			DB.trigger( 'IndexedDB_database_already_loaded', context );
			return;
		}
			
		if ( !DB.assert( !DB.isEmpty( name ), "database name cannot be empty" ) ) { 
			return;
		}
		
		if ( !DB.assert( !DB.isEmpty( description ), "database description cannot be empty" ) ) { 
			return;
		}

		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}
		
		/* Action */
		DB.trigger( 'IndexedDB_database_loading', context );
		
		/* Request Responses */

		if ( "undefined" !== typeof DB.db && name === DB.db.name ) {
			DB.trigger( 'IndexedDB_database_load_success', context );
			DB.trigger( 'IndexedDB_stores_load_success', context );
		} else {
			var open_request = window.indexeIndexedDB.open( name, description );
			open_request.onsuccess = function ( event ) {
				var result = event.target.result;
				on_success( result );
				if ( isNaN( DB.db.version ) ) {
					DB.trigger( 'IndexedDB_database_load_success', result );
					DB.trigger( 'IndexedDB_database_created_success', result );
					/* Database is unversioned, so create object stores */
					DB.trigger( 'IndexedDB_stores_load_success', result );
				} else {
					DB.trigger( 'IndexedDB_database_load_success', result );
					DB.trigger( 'IndexedDB_stores_load_success', result );
				}
			}
			open_request.onerror = function ( event ) {
				context[ 'event' ] = event;
				on_error( context );
				DB.trigger( 'IndexedDB_database_load_error' );
			}
			open_request.onabort = function ( event ) {
				context[ 'event' ] = event;
				on_abort( context );
				DB.trigger( 'IndexedDB_database_load_error' )
			}
		}
	}

	DB.checkBrowser = function () {
		DB.trigger( 'IndexedDB_checking_browser' );		
		var result = -1;
		// the support check
		if ( !!window.webkitIndexedDB || !!window.mozIndexedDB ) {
			result = 0;
		} else if (!!window.indexedDB ) {
			result = 1;
		}
		//TODO: Allow filter
		//result = DB.trigger( 'DB_did_browserSupported', { "result": result } );
		DB.trigger( 'IndexedDB_checked_browser', { "result": result } );
		return result;
	}

	/**
	 * DB.assert( statement, string, string ) - handy little tool for unit tests
	 * statement (mixed): whatever you want to evaluate
	 * warn_level (string): log, alert or *error (*default) 
	 *
	 **/
	DB.assert = function ( statement, error_message, warn_level ) {

		error_message = ( !!error_message ) ? error_message : "Unknown error.";
		result = false;
		switch( warn_level ) {
			case 'log':
				( statement ) ? result = true : console.log ( 'Assertion failed: ' + error_message, arguments[ 0 ] );
				break;
			case 'alert': 
				( statement ) ? result = true : alert( 'Assertion failed: ' + error_message, arguments[ 0 ] );
				break;
			default: 
				if ( statement ) { 
					result = true;
				} else {
					console.log( error_message );
					throw new Error( 'Assertion failed: ' + error_message, arguments[ 0 ] );
				}
				break;
		}
		return result;
	}



	DB.exists = function( mixed_var ) {
		return ( DB.isEmpty( mixed_var ) ) ? false : true;
	};

	/* DB.isEmpty ( mixed var ) -> bool
	 * Checks whether a variable has a value */
	DB.isEmpty = function ( mixed_var ) {
		if ( !!DB.debug && "verbose" === DB.debug ) {
			console.log ( '"undefined" !== typeof mixed_var', "undefined" !== typeof mixed_var );
			console.log ( 'null !== mixed_var', null !== mixed_var );
			console.log ( '"" !== mixed_var', "" !== mixed_var );
			console.log ( '!!mixed_var', !!mixed_var );
		}
		return ( "undefined" !== typeof mixed_var && null !== mixed_var && "" !== mixed_var ) ? false : true;
	}

	DB.isObject = function ( mixed_var ) {
		return DB.isType( "object", mixed_var );
	}

	DB.isString = function ( mixed_var ) {
		return DB.isType( "string", mixed_var );
	}

	DB.isFunction = function ( mixed_var ) {
		return DB.isType( "function", mixed_var );
	}

	DB.isNumber = function ( mixed_var ) {
		return DB.isType( "number", mixed_var );
	}

	DB.isBoolean = function ( mixed_var ) {
		return DB.isType( "boolean", mixed_var ) || 'true' == mixed_var || 'false' == mixed_var;
	}

	DB.isType = function ( type, mixed_var ) {
		return ( type !== typeof mixed_var ) ? false : true;
	}

	/* DB.fixBrowser( ) -> null 
	 * Sets up expermental interfaces if necessary. For use when a browser has not yet implemented the native (window.IndexedDB) dom interface, which is detectable if DB.browser_supported returns -1. */
	DB.fixBrowser = function () {
		DB.trigger( 'doing_fixBrowser' );		
		if (typeof window.webkitIndexedDB !== "undefined") {
			window.IDBCursor = window.webkitIDBCursor;
			window.IDBDatabase = window.webkitIDBDatabase;
			window.IDBDatabaseError = window.webkitIDBDatabaseError;
			window.IDBDatabaseException = window.webkitIDBDatabaseException;
			window.IDBErrorEvent = window.webkitIDBErrorEvent;
			window.IDBEvent = window.webkitIDBEvent;
			window.IDBFactory = window.webkitIDBFactory;
			window.IDBIndex = window.webkitIDBIndex;
			window.IDBKeyRange = window.webkitIDBKeyRange;
			window.IDBObjectStore = window.webkitIDBObjectStore;
			window.IDBRequest = window.webkitIDBRequest;
			window.IDBSuccessEvent = window.webkitIDBSuccessEvent;
			window.IDBTransaction = window.webkitIDBTransaction;
			window.indexedDB = window.webkitIndexedDB;
		} else if ('mozIndexedDB' in window) {
			window.indexedDB = window.mozIndexedDB;
		}
	}

	/* End IndexedDB Methods */

	DB.index.exists = function ( store, index ) {
		if( !!DB.debug ) {
			console.log( 'DB.index.exists', store, index );
		}
		var store = DB.transaction.create( store );
		var indexes = store.indexNames;
		if( 'undefined' !== typeof indexes && null !== indexes && index.length > 0 ) {
			for( var i=0; i< indexes.length; i++ ) {
				if ( name === indexes[i] ) {
					return true;
				}
			}
		}
		return false;
	}


	/* Begin Object Store Methods */

	DB.store.exists = function ( name ) {
	/*	if( "function" === typeof DB.db.objectStores.contains ) {
			return DB.db.objectStores[ 'contains' ]( name ); //TODO: #Question: Not in IndexedDB spec?
		} */
		for( i=0; i<DB.db.objectStoreNames.length; i++ ) {
			if ( name === DB.db.objectStoreNames[i] ) {
				return true;
			}
		}
		return false;
	}



	/* Create object stores after the database is created */
	DB.bind( 'IndexedDB_do_stores_create', function ( event, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_create_stores', event, context );
		}

		/* Setup */

		var stores = context.stores;
		var on_success = context.on_success;
		var on_error = context.on_error;
		var on_abort = context.on_abort;

		/* Assertions */

		// Assert that the database is already loaded
		if ( !DB.assert( DB.db !== 'Object', 'Database not loaded' ) ) {
			if ( !!DB.debug ) {
				console.log ( 'Database created', event, context );
			}
		}

		/* Request */

		DB.stores.create( stores, on_success, on_error, on_abort );

	} );


	DB.stores.create = function ( stores, on_success, on_error, on_abort ) {

		var context = { 'stores': stores, 'on_success': on_success, 'on_error': on_error, 'on_abort': on_abort }; 
		//TODO: Assertions
		for( store in stores ) {

			var options = stores[ store ];

			if ( DB.isString( options ) ) {
				/* options object is really a string
				 * recast options var from a string to a
				 * real deal options object */
				options = DB.store.options( options );
			}
			if ( !DB.store.exists( store ) ) {
				/* Setup */
				if( !!DB.debug ) {
					console.log('Store doesn\'t yet exist', store, options  );
				}
				//TODO: Cleanup; if/else logic here is a little muddy (why the empty_key var?)
				var key, autoinc_key, empty_key, unique;
				if( "undefined" !== typeof options && !DB.isEmpty( options.key ) ) {
					key = options.key;
					unique = options.unique;
					autoinc_key = options.incrementing_key;
					empty_key = DB.isEmpty( key );
				} else {
					for( attrib in options ) {
						// Don't want prototype attributes
						if( options.hasOwnProperty( attrib ) ) {
							key = attrib;
							unique = options[ attrib ];
							autoinc_key = false;
						}
					}
				}

				/* Defaults */

				if ( "undefined" === typeof unique || !DB.isBoolean( unique ) ) { 
					unique = false; 
				}

				if ( "undefined" === typeof autoinc_key || !DB.isBoolean( autoinc_key ) ) { 
					autoinc_key = false; 
				}

				/* Assertions */

				DB.assert( ( empty_key || DB.isString( key ) ), 'Key needs to be a string' );
				DB.assert( ( DB.isBoolean( autoinc_key ) ), 'Autoinc_key (whether the key uses a generator) needs to be a boolean' ); 

				/* Debug */

				if( !!DB.debug ) {
					console.log( 'DB.stores.create calling DB.store.create', store, key, autoinc_key, on_success, on_error, on_abort );
				}

				/* Request */
					
				DB.store.create( store, key, autoinc_key, unique, on_success, on_error, on_abort );

			}
		}
	};


	DB.store.options = function ( key, autoinc_key ) {
		//TODO: Assertions key is valid string; autoinc_key is bool (isBoolean?)
		var obj = { 
			'keyPath': ( !!key ) ? key : null
			//, autoIncrement: ( !!key && autoinc_key ) ? true : false
		};
		return obj;
	}

	/* Create object stores after the database is created */
	DB.bind( 'IndexedDB_do_store_create', function ( event, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_create_store', event, context );
		}

		/* Setup */

		var name = context.name;
		var key = context.key;
		var autoinc_key = context.incrementing_key;
		console.log( 'THE BIG REVEAL', context.incrementing_key, autoinc_key );
		var unique = context.unique;
		var on_success = context.on_success;
		var on_error = context.on_error;
		var on_abort = context.on_abort;
		var on_blocked = context.on_blocked;

		/* Assertions */

		// Assert that the database is already loaded
		if ( !DB.assert( DB.db !== 'Object', 'Database not loaded' ) ) {
			if ( !!DB.debug ) {
				console.log ( 'Database created', event, context );
			}
		}

		/* Request */
		
		DB.store.create( name, key, autoinc_key, unique, on_success, on_error, on_abort, on_blocked );

	} );


	/* return true if request is successfully requested (no bearing on result)
	/* autoinc_key defaults to false if a key is specified;
	   key gets set to "key" and autoincrements when key is not specified */
	DB.store.create = function ( name, key, autoinc_key, unique, on_success, on_error, on_abort, on_blocked ) {
		
		/* Debug */
		
		console.log('DB.store.create', name, key, autoinc_key, unique, on_success, on_error, on_abort );

		if( !!DB.debug ) {
			console.log ( "DB.store.create", name, key, autoinc_key, on_success, on_error, on_abort );
		}

		/* Assertions */	

		if ( !DB.assert( !DB.isEmpty( name ), "object store name should not be empty" ) ) { 
			return false;
		}

		if ( !DB.assert( !DB.store.exists( name ) , "object store should not already exist" ) ) { 
			return false;
		}

		// TODO: #Question: Is this true?
		if ( !DB.assert( !DB.isEmpty( key ), "object store needs a key" ) ) { 
			return false;
		}

		var keyPath = {};

		if ( 'undefined' !== typeof key ) {
			keyPath = key;	
		}

		if ( 'undefined' == typeof autoinc_key ) {
			autoinc_key = false;
		}

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}
		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}
		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}
		if ( "undefined" === typeof on_blocked ) {
			on_blocked = DB.events.onBlocked;
		}
		
		var context =  { "name": name, "keyPath": keyPath, "autoinc_key": autoinc_key };

		/* Debug */
		
		if( !!DB.debug ) {
			console.log( 'DB.store.create context', context );
		}

		// Database changes must happen w/in a setVersion transaction
		var version = parseInt( DB.db.version, 10 );
		version = ( isNaN( version ) ) ? 1 : version + 1;
		
		var setVersionRequest = DB.db.setVersion( version );
		console.log(setVersionRequest);
		setVersionRequest.onsuccess = function ( event ) {
			try {

				/* Database options */

				var options = {};
				
				if( 'undefined' !== typeof keyPath && null !== keyPath ) {
					options[ 'keyPath' ] = keyPath;
				} 
				if( 'undefined' !== typeof autoinc_key && null !== autoinc_key ) {
					options[ 'autoIncrement' ] = autoinc_key;
				}
				console.log('options~', options );	
				DB.db.createObjectStore( name, options );

				context[ 'event' ] = event;

				on_success( context );

				DB.trigger( "IndexedDB_store_created_success", context );

			} catch( error ) {

				// createdObject store threw an error 
				context[ 'error' ] = error;
				on_error( context );
				DB.trigger( "IndexedDB_store_created_error", context );
				//if already created, then the store already exists
				if ( IDBDatabaseException.CONSTRAINT_ERR === error.code ) {
					DB.trigger( "IndexedDB_store_already_exists", context );
				}
			}
		};

		setVersionRequest.onblocked = function ( event ) {
			context[ 'event' ] = event;
			on_blocked( context );
			DB.trigger( "IndexedDB_store_created_error", context );
		};

		setVersionRequest.onerror = function ( event ) {
			context[ 'event' ] = event;
			on_error( context );
			DB.trigger( "IndexedDB_store_created_error", context );
		};

		setVersionRequest.onabort = function ( event ) {
			context[ 'event' ] = event;
			on_abort( context );
			DB.trigger( "IndexedDB_store_created_abort", context );
		};

	}


	DB.bind( 'IndexedDB_do_indexes_create', function ( event, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_create_indexes', event, context );
		}

		/* Setup */

		var indexes = context.indexes;
		var on_success = context.on_success;
		var on_error = context.on_error;
		var on_abort = context.on_abort;

		/* Assertions */

		// Assert that the database is already loaded
		if ( !DB.assert( DB.db !== 'Object', 'Database not loaded' ) ) {
			return;
		}

		/* Request */
		
		DB.indexes.create( indexes, on_success, on_error, on_abort );

	} );

	DB.indexes.create = function ( stores, on_success, on_error, on_abort ) {
		var context = { 'indexes': stores, 'on_success': on_success, 'on_error': on_error, 'on_abort': on_abort }; 
		if( !!DB.debug ) {
			console.log( 'DB.indexes.create', context );
		}
		//TODO: Assertions
		for( store in stores ) {
			//TODO: Cache vars to previous()ent wasted nested lookups
			for( index in stores[store] ) {
				if( stores[store].hasOwnProperty( index ) ) {

					var options = stores[store][index];
					var key, unique, empty_key, multirow;
					var name = index;

					if ( !DB.index.exists( store, index ) ) {
						//TODO: Cleanup
						if( "undefined" !== typeof options && !DB.isEmpty( options.key ) ) {
							key = options.key;
							unique = options.unique;
						} else {
							for( attrib in options ) {
								// Don't want prototype attributes
								if( options.hasOwnProperty( attrib ) ) {
									key = attrib;
									var opts = options[attrib];
									if( 'undefined' !== typeof opts && 'undefined' !== typeof opts[ 'unique' ] || 'undefined' !== typeof options[ 'multirow' ] ) {
										unique = opts.unique;
										multirow = opts.multirow;
									} else {
										unique = options[ attrib ];
									}
									console.log( 'setting key',key);
									console.log( 'setting key multirow',multirow);
									console.log( 'setting key unique',unique);
								}
							}
						}
					}
				}

				if ( "undefined" === typeof unique || !DB.isBoolean( unique ) ) { 

					unique = false; 
				}

				/* Assertions */
				
				DB.assert( !DB.isEmpty( key ), 'Must provide an index key' );  
				DB.assert( ( DB.isBoolean( unique ) ), 'Unique key value must be a boolean' );

				/* Debug */

				if( !!DB.debug ) {
					console.log( 'DB.indexes.create calling DB.index.create', store, key, name, unique, multirow, on_success, on_error, on_abort );
				}

				/* Request */
				
				DB.index.create( store, key, name, unique, multirow, on_success, on_error, on_abort );
				
			}
		}
	};


	//context.store, context.key, context.index, context.on_success, context.on_error, context.on_abort, context.unique, context.multirow
	DB.bind( 'IndexedDB_do_index_create', function( row_result, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_index_create', row_result, context );
		}

		/* Assertions */
		if ( !DB.assert( !DB.isEmpty( context.store ), 'Must provide a store for index' ) ) {
			return;
		}
				
		if ( !DB.assert( !DB.isEmpty( context.key ), 'Must provide a key for index' ) ) {
			return;
		}
		
		if ( !DB.assert( !DB.isEmpty( context.name ), 'Must provide a name for index' ) ) {
			return;
		}


		/* Invocation */

		DB.index.create( context.store, context.key, context.name, context.unique, context.multirow, context.on_success, context.on_error, context.on_abort );
	} );


	/* unique defaults to false if not present */
	DB.index.create = function ( store, key, name, unique, multirow, on_success, on_error, on_abort ) {
		
		/* Debug */

		if( !!DB.debug ) {
			console.log( 'DB.index.create', store, key, name, unique, multirow, on_success, on_error, on_abort );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide a store for index' ) ) {
			return;
		}
				
		if ( !DB.assert( !DB.isEmpty( key ), 'Must provide a key for index' ) ) {
			return;
		}
		
		if ( !DB.assert( !DB.isEmpty( name ), 'Must provide a name for index' ) ) {
			return;
		}

		/* Defaults */	

		if ( "undefined" === typeof unique ) {
			unique = false;	
		}

		if ( "undefined" === typeof multirow ) {
			multirow = false;	
		}


		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		/* Context */

		var context = { "store": store, "key": key, "name": name, "unique": unique, "multirow": multirow, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

		/* Request */

		// Database changes need to happen from w/in a setVersionRequest
		var version = ( parseInt( DB.db.version, 10 ) ) ? parseInt( DB.db.version, 10 ) : 0;
		var setVersionRequest = DB.db.setVersion( version );
		console.log('index setVersion setup', setVersionRequest, version);
		/* Request Responses */

		setVersionRequest.onsuccess = function ( event ) {
			var result = event.target.result;
			var databaseTransaction = result.objectStore( store );
			try {
				console.log('attempting to create using db tx', databaseTransaction);
				databaseTransaction.createIndex( name, key, { 'unique': unique, 'multirow': multirow } );
				on_success( event );
			} catch ( error ) {
				console.log( error );
			}
		};

		setVersionRequest.onerror = function ( event ) {
			context[ 'event' ] = event;
			on_error( context );
		};

		setVersionRequest.onabort = function ( event ) {
			context[ 'event' ] = event;
			on_abort( context );
		};

	}

	//context.store, context.key, context.index, context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_index_delete', function( row_result, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_index_delete', row_result, context );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( context.store ), 'Must provide a store for index' ) ) {
			return;
		}
				
		if ( !DB.assert( !DB.isEmpty( context.name ), 'Must provide a name for index' ) ) {
			return;
		}

		/* Invocation */

		DB.index.delete( context.store, context.name, context.on_success, context.on_error, context.on_abort );

	} );


	/* unique defaults to false if not present */
	DB.index.delete = function ( store, name, on_success, on_success, on_abort ) {
		
		/* Debug */

		if( !!DB.debug ) {
			console.log( 'DB.index.delete', store, name, on_success, on_error, on_abort );
		}

		/* Assertions */	

		if ( !DB.assert( !DB.isEmpty( store ), "object store name cannot be empty" ) ) { 
			return;
		}

		if ( !DB.assert( !DB.isEmpty( name ), "index name cannot be empty" ) ) { 
			return;
		}

		/* Defaults */	

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}
		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}
		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		/* Context */

		var context = { "store": store, "name": name, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

		/* Request */

		// Database changes need to happen from w/in a setVersionRequest
		var version = ( parseInt( DB.db.version, 10 ) ) ? parseInt( DB.db.version, 10 ) : 0;
		var setVersionRequest = DB.db.setVersion( version );

		/* Request Responses */

		setVersionRequest.onsuccess = function ( event ) {
		
			var result = event.target.result;
			var databaseTransaction = result.objectStore( store );
			console.log( databaseTransaction );
			databaseTransaction.deleteIndex( name );

			databaseTransaction.onsuccess = function ( event ) {
				context[ 'event' ] = event;
				on_success( context );
				DB.trigger( 'index_created_success', context );
			};

			databaseTransaction.onerror = function ( event ) {
				context[ 'event' ] = event;
				on_error( context );
				DB.trigger( 'index_created_error', context );
			};

			databaseTransaction.onabort = function ( event ) {
				context[ 'event' ] = event;
				on_abort( context );
				DB.trigger( 'index_created_abort', context );
			};		

		};

		setVersionRequest.onerror = function ( event ) {
			context[ 'event' ] = event;
			on_error( context );
		};

		setVersionRequest.onabort = function ( event ) {
			context[ 'event' ] = event;
			on_abort( context );
		};

	}

	DB.database.open = function ( name, description, on_success, on_error, on_abort ) {

		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}
		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}
		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		/* Context */

		var context = { "name": name, "description": description, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

		/* Action */

		DB.trigger( 'IndexedDB_open_database', context );

		/* Request */

		var open_database_request = window.indexeIndexedDB.open( name, description );

		/* Request Responses */

		database_open_request.onsuccess = function ( event ) {

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_success( context );

			/* Action */

			DB.trigger( 'IndexedDB_open_database_success', context );

		};

		database_open_request.onerror = function ( event ) {
			
			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_error( context );

			/* Action */

			DB.trigger( 'IndexedDB_open_database_error', context );

		}

		database_open_request.onabort = function ( event ) {

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_abort( context );

			/* Action */

			DB.trigger( 'IndexedDB_open_database_abort', context );

		}

	}

	/**
	 * Transactions
	 *
	 **/

	/* Transaction types */
	DB.transaction.read = function () {
		return IDBTransaction.READ_ONLY;
	} 
	DB.transaction.read_write = function () {
		return IDBTransaction.READ_WRITE;
	} 
	DB.transaction.write = function () {
		return IDBTransaction.READ_WRITE;
	}

	/**
	 * Directions
	 *
	 **/

	/* Direction types */

	DB.cursor = DB.cursor || {};
	DB.cursor.direction = DB.cursor.direction || {};

	DB.cursor.direction.next = function( no_dupes ) {
		no_dupes = ( !!no_dupes ) ? no_dupes : false;
		var result = ( !!no_dupes ) ? IDBCursor.NEXT_NO_DUPLICATE : IDBCursor.NEXT; 
		return result;
	};
	DB.cursor.direction.previous = function( no_dupes ) {
		no_dupes = ( !!no_dupes ) ? no_dupes : false;
		var result = ( !!no_dupes ) ? IDBCursor.PREV_NO_DUPLICATE : IDBCursor.PREV;
		return result;
	}

	DB.cursor.isDirection = function( direction ) {
		direction = ( 'undefined' !== typeof direction && DB.isNumber( direction ) && direction >= DB.cursor.direction.next() && direction <= DB.cursor.direction.previous( true ) ) ? true : false;
		return direction;
	};



	/* Transaction factory */
	DB.transaction.create = function ( database, type, on_complete, on_error, on_abort ) {
		DB.trigger( 'IndexedDB_create_transaction', { "name": name, "type": type, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );		
		if ( "undefined" === typeof type ) {
			type = IDBTransaction.READ_WRITE;
		}
		if ( "undefined" === typeof timeout ) {
			timeout = 1000;
		}
		if ( "undefined" === typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}
		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}
		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}
		try {
			if ( !!DB.debug ) {
				console.log ( "DB.db.transaction.create", database, type, timeout );
			}
			var transaction = DB.db.transaction( [ database ], type, timeout );
			transaction.oncomplete = function ( event ) {
				on_complete( event );
				DB.trigger( 'transaction_complete', { "database": database, "type": type, "timeout": timeout } );
			};
			transaction.onerror = function ( event ) {
				on_error( event );
				DB.trigger( 'transaction_error', { "database": database, "type": type, "timeout": timeout } );
			};
			transaction.onabort = function ( event ) {
				on_abort( event );
				DB.trigger( 'transaction_abort', { "database": database, "type": type, "timeout": timeout } );
			};
			return transaction.objectStore( database );
		} catch ( event ) {
			return event;
		};
	}


	DB.row.result = function ( event ) {
		if( 'undefined' !== typeof event && 'undefined' !== typeof event.event ) {
			event = event.event;
		}
		if ( 'undefined' !== typeof event && "undefined" !== typeof event.result ) {
			return event.result;
		} else {
			return null;
		}
	}


	DB.row.value = function ( event ) {

		if ( !!DB.debug ) {
			console.log ( 'DB.row.value', event );
		}

		if( 'undefined' !== typeof event && 'undefined' !== typeof event.event ) {
			event = event.event;
		}

		if ( "undefined" !== typeof event && null !== event && "undefined" !== typeof event.target && "undefined" !== typeof event.target.result && null !== event.target.result ) {
			return event.target.result;
		} else {
			return null;
		}

	}


	DB.cursor.result = function ( event ) {
		if ( !!DB.debug ) {
			console.log ( 'DB.cursor.result', event );
		}
		if( 'undefined' !== typeof event && 'undefined' !== typeof event.event ) {
			event = event.event;
		}
		if ( 'undefined' !== typeof event && "undefined" !== typeof event.target && "undefined" !== typeof event.target.result ) {
			return event.target.result;
		} else {
			return null;
		}
	}


	DB.cursor.value = function ( event ) {
		if ( !!DB.debug ) {
			console.log ( 'DB.cursor.value', event );
		}
		if( 'undefined' !== event && null !== event && 'undefined' !== typeof event.event ) {
			event = event.event;
		}
		if ( 'undefined' !== event && null !== event && "undefined" !== typeof event.target && "undefined" !== typeof event.target.result && null !== event.target.result ) {
			return event.target.result.value;
		} else {
			return null;
		}
	}


	DB.database.errorType = function ( code ) {

		if ( 8 === code ) {
			return "Request aborted";
		} else if ( 4 === code ) {
			return "Already exists";
		} else if ( 13 === code ) {
			return "Deadlock";
		} else if ( 2 === code ) {
			return "Not allowed";
		} else if ( 5 === code ) {
			return "Bad data format";
		} else if ( 6 === code ) {
			return "Not allowed";
		} else if ( 3 === code ) {
			return "Not found";
		} else if ( 9 === code ) {
			return "Read only";
		} else if ( 10 === code ) {
			return "Application failure";
		} else if ( 11 === code ) {
			return "Data serialization error";
		} else if ( 12 === code ) {
			return "Timeout";
		} else if ( 7 === code ) {
			return "Transaction inactive";
		} else if ( 11 === code ) {
			return "Temporary issue";
		} else if ( 1 === code ) {
			return "Unknown error";
		}

	}


	/* Key Ranges */

	/* Key range helpers */
	DB.range.only = function ( value ) {
		return DB.range.get( value, null, null, null, null );
	}
	DB.range.left = function ( left_bound ) {
		return DB.range.get( null, left_bound, null, false, null );
	}
	DB.range.left_open = function ( left_bound ) {
		return DB.range.get( null, left_bound, null, true, null );
	}
	DB.range.right = function ( right_bound ) {
		return DB.range.get( null, null, right_bound, null, false );
	}
	DB.range.right_open = function ( right_bound ) {
		return DB.range.get( null, null, right_bound, null, true );
	}

	/* returns an IDBKeyRange given a range type
	 * returns false if type is not valid;
	 * valid types: bound, leftBound, only, rightBound */
	/* uses duck typing to determine key type */
	/* more info: https://developer.mozilla.org/en/indexeddb/idbkeyrange*/
	DB.range.get = function ( value, left_bound, right_bound, includes_left_bound, includes_right_bound ) {
		if ( !!DB.debug ) {
			console.log ( 'DB.range.get', value, left_bound, right_bound, includes_left_bound, includes_right_bound );
		}
		if ( DB.exists( left_bound ) && DB.exists( right_bound ) && DB.exists( includes_left_bound ) && DB.exists( includes_right_bound ) ) {	
			return IDBKeyRange.bound( left_bound, right_bound, includes_left_bound, includes_right_bound );	
		} else if ( DB.exists( left_bound ) && DB.exists( includes_left_bound ) ) {
			return IDBKeyRange.lowerBound( left_bound, includes_left_bound );
		} else if ( DB.exists( right_bound ) && DB.exists( includes_right_bound ) ) {
			return IDBKeyRange.upperBound( right_bound, includes_right_bound );
		} else if ( DB.exists( value ) ) {
			return IDBKeyRange.only( value );
		}  else {
			return false;
		}
	}


	//context.store, context.key, context.index, context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_row_get', function( row_result, context ) {
		
		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_row_get', row_result, context );
		}

		/* Setup */

		var store = context.store;

		var key = context.key;

		var index = context.index;

		/* Defaults */

		index = ( 'undefined' !== index ) ? index : null;

		/* Assertions */
		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}
			
		if ( !DB.assert( !DB.isEmpty( key ), 'Must provide a key to get' ) ) {
			return;
		}

		/* Invocation */

		DB.row.get( store, key, index, context.on_success, context.on_error, context.on_abort, context.on_complete );
	} );


	DB.row.get = function ( store, key, index, on_success, on_error, on_abort, on_complete ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.row.get', store, key, index, on_success, on_error, on_abort, on_complete );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}
			
		if ( !DB.assert( !DB.isEmpty( key ), 'Must provide a key to get' ) ) {
			return;
		}

		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" === typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}

		index = ( !DB.isEmpty( index ) ) ? index : null;

		/* Context */

		var context =  { "store": store, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

		/* Action */

		DB.trigger( 'IndexedDB_row_get', context );

		/* Transaction */
		
		var transaction = DB.transaction.create( store, DB.transaction.read(), on_complete );


		/* Debug */
		
		if ( !!DB.debug ) {
			console.log ( 'DB.row.get transaction', transaction );
		}

		/* Request */



		var request;
		if ( "undefined" !== typeof index && null !== index ) {
			var transaction_index = transaction.index( index );
			if( !!DB.debug ) {
				console.log( 'DB.row.get (using index)', transaction, transaction_index, index, key );
			}
			/* Optional Index */

			request = transaction_index.get( key );
			//request = transaction.get( key );

		} else {

			/* Optional Index */

			request = transaction.get( key );

		}
		
		/* Request Responses */
		
		request.onsuccess = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_success( context );
		
			/* Action */
			
			DB.trigger( 'IndexedDB_row_get_success', context );

		}

		request.onerror = function ( event ) {
		
			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_error( context );

			/* Action */

			DB.trigger( 'IndexedDB_row_get_error', context );

		}
		
		request.onabort = function ( event ) {
		
			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_abort( context );
		
			/* Action */
		
			DB.trigger( 'IndexedDB_row_get_abort', context );

		}
	}


	//context.store, context.key, context.index, context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_row_delete', function( row_result, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_row_delete', row_result, context );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( context.store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( context.key ), 'Must provide a key to delete' ) ) {
			return;
		}	

		/* Invocation */

		DB.row.delete( context.store, context.key, context.on_success, context.on_error, context.on_abort, context.on_complete );

	} );


	DB.row.delete = function ( store, key, on_success, on_error, on_abort, on_complete ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.row.delete', store, key, on_success, on_error, on_abort );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( key ), 'Must provide a key to delete' ) ) {
			return;
		}

		/* Context */

		var context = { "store": store, "key": key, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

		/* Action */

		DB.trigger( 'IndexedDB_row_delete', context );

		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}
		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}
		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}
		if ( "undefined" === typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}
		
		/* Transaction */

		var transaction = DB.transaction.create( store, DB.transaction.write(), on_complete );

		
		/* Debug */
		
		if ( !!DB.debug ) {
			console.log ( 'DB.row.delete transaction', transaction );
		}

		/* Request */

		var request = transaction[ "delete" ]( key );

		/* Request Responses */
		
		request.onsuccess = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_success( context );
		
			/* Action */

			DB.trigger( 'set_success', context );

		}

		request.onerror = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_error( context );
		
			/* Action */

			DB.trigger( 'set_error', context );

		}

		request.onabort = function ( event ) {	
		
			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_abort( event );
		
			/* Action */

			DB.trigger( 'set_abort', context );

		}

	}

	//context.store, context.data, context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_row_add', function( row_result, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_row_add', row_result, context );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( context.store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( context.data ), 'Must provide an object to store' ) ) {
			return;
		}

		/* Invocation */

		DB.row.add( context.store, context.data, context.on_success, context.on_error, context.on_abort, context.on_complete );

	} );


	/* Adds a data object to an object store */
	DB.row.add = function ( store, data, on_success, on_error, on_abort, on_complete ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.row.add', store, data, on_success, on_error, on_abort );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( data ), 'Must provide an object to store' ) ) {
			return;
		}


		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" === typeof on_abort ) {
			on_complete = DB.events.onComplete;
		}


		/* Context */

		var context = { "store": store, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };


		/* Action */

		DB.trigger( 'IndexedDB_row_add', context );

		if ( !!DB.debug ) {
			console.log( 'IndexedDB_row_add', context );
		}


		/* Transaction */

		var transaction = DB.transaction.create( store, DB.transaction.read_write(), on_complete );

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.row.add transaction', data, transaction );
		}

		//use this[ 'format' ] for function invocation to avoid a Closure compiler error
		try {
			var request = transaction[ 'add' ]( data );
			request.onsuccess = function ( event ) {	

				/* Context */

				context[ 'event' ] = event;
		

				/* Callback */

				on_success( context );
		

				/* Action */

				DB.trigger( 'IndexedDB_row_add_success', context );

			}

			request.onerror = function ( event ) {
		
				/* Context */

				context[ 'event' ] = event;
		

				/* Callback */

				on_error( context );

		
				/* Action */

				DB.trigger( 'IndexedDB_row_add_error', context );

			}

			request.onabort = function ( event ) {

				/* Context */

				context[ 'event' ] = event;
		

				/* Callback */

				on_abort( context );


				/* Action */

				DB.trigger( 'IndexedDB_row_add_abort', context );

			}

		} catch( event ) {

			/* Debug */

			if ( !!DB.debug ) {
				console.log ( event );
				console.log ( 'errorType', DB.database.errorType( event.code ) );
			}	
			
			/* Context */

			context[ 'event' ] = event;
				

			/* Action */

			DB.trigger( 'IndexedDB_row_add_error', context );

		}
	}


	//context.store, context.key, context.index, context.data, context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_row_update', function( row_result, context ) {
		
		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_row_update', row_result, JSON.stringify( context ) );
		}


		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( context.store ), 'Must provide an object store' ) ) {
			return;
		}
			
		if ( !DB.assert( !DB.isEmpty( context.key ), 'Must provide a range to get' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( context.data ), 'Must provide data to update' ) ) {
			return;
		}

		/* Invocation */

		DB.row.update( context.store, context.key, context.index, context.data, context.replace, context.expecting, context.on_success, context.on_error, context.on_abort, context.on_complete );


	} );


	DB.row.update = function ( store, key, index, data, replace, expecting, on_success, on_error, on_abort, on_complete ) {


		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.row.update', store, key, index, on_success, on_error, on_abort, on_complete );
		}


		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}
			
		if ( !DB.assert( !DB.isEmpty( key ), 'Must provide a range to get' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( data ), 'Must provide data to update' ) ) {
			return;
		}


		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" === typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}

		index = ( !DB.isEmpty( index ) ) ? index : null;
		
		expecting = ( !DB.isEmpty( expecting ) ) ? expecting : null;
		
		replace = ( DB.isBoolean( replace ) ) ? replace : false;

		/* Context */

		var context =  { "store": store, "key": key, "index": index, "data": data, "replace": replace, "expecting": expecting, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

		/* Action */

		DB.trigger( 'IndexedDB_row_update', context );

		var callback = function( callback_context ) {

			var result = DB.row.value( callback_context.event );
			if( 'function' == typeof data ) {
				data = data( result );
			}
			if( false == replace ) {
				var temp_data = data;
				for( attr in result ) {
					var value = data[ attr ];
					if( 'function' == typeof value ) {
						value = value( result[ attr ] );
					}
					if( 'undefined' !== typeof expecting && null !== expecting && 'undefined' !== typeof expecting[ attr ] && null !== expecting[ attr ] ) {
						if( result[ attr ] !== expecting[ attr ] ) {

							if( !!DB.debug ) {
								console.log( 'DB.row.update > value was not expected.', result[ attr ], expecting[ attr ] );
							}

							var err = new Error( 'Found ' + result[ attr ] + ', expecting ' + expecting[ attr ] );
							context[ 'event' ] = err;

							on_error( context );

						}

					}
					if( 'undefined' !== typeof value ) {
						temp_data[ attr ] = value;
					} else {
						temp_data[ attr ] = result[ attr ];
					}
				}
				data = temp_data;
			}

			if( !!DB.debug ) {
				console.log( 'DB.row.update context', context );
				console.log( 'DB.row.update before/after', result, data );
			}

			DB.row.put( store, data, null, on_success, on_error, on_abort, on_complete );

		};

		DB.row.get( context.store, context.key, context.index, callback, context.on_error, context.on_abort );

	}



	//context.store, context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_store_clear', function( row_result, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_store_clear', row_result, context );
		}


		/* Assertions */
		
		if ( !DB.assert( !DB.isEmpty( context.store ), 'Must provide an object store' ) ) {
			return; 
		}       


		/* Invocation */

		DB.store.clear( context.store, context.on_success, context.on_error, context.on_abort );

	} );


	/* Clears an object store of any objects */
	DB.store.clear = function ( store, on_success, on_error, on_abort ) {

		/* Debug */

		if( !!DB.debug ) {	
			console.log ( 'DB.store.clear', store, on_success, on_error, on_abort );	
		}

		/* Assertions */
		
		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return; 
		}       


		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" === typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}


		/* Context */

		var context = { "store": store, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

		
		/* Action */

		DB.trigger( 'IndexedDB_store_clear', context );


		/* Transaction */

		var transaction = DB.transaction.create( store, DB.transaction.read_write(), on_complete );


		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.store.clear transaction', transaction );
		}


		/* Request */

		//use this[ 'format' ] for function invocation to avoid a Closure compiler error
		var request = transaction[ 'clear' ];

		/* Request Responses */

		request.onsuccess = function ( event ) {	
			
			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_success( event );

			/* Action */

			DB.trigger( 'IndexedDB_store_clear_success', context );

		}

		request.onerror = function ( event ) {
			
			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_error( event );

			/* Action */

			DB.trigger( 'IndexedDB_row_put_error', context );

		}

		request.onabort = function ( event ) {
			
			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_abort( event );
			
			/* Action */

			DB.trigger( 'IndexedDB_row_put_abort', context );

		}
	}


	//context.store, context.data, context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_row_put', function( row_result, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_row_put', row_result, context );
		}

		/* Assertions */
		
		if ( !DB.assert( !DB.isEmpty( context.store ), 'Must provide an object store' ) ) {
			return; 
		}       

		if ( !DB.assert( !DB.isEmpty( context.data ), 'Must provide an object to store' ) ) {
			return; 
		}       

		/* Invocation */

		DB.row.put( context.store, context.data, context.key, context.on_success, context.on_error, context.on_abort, context.on_complete );

	} );


	/* Puts a data object to an object store */
	DB.row.put = function ( store, data, key, on_success, on_error, on_abort, on_complete ) {

		/* Debug */
		
		if ( !!DB.debug ) {
			console.log ( 'DB.row.put', store, data, key, on_success, on_error, on_abort, on_complete );	
		}

		/* Assertions */
		
		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return; 
		}       

		if ( !DB.assert( !DB.isEmpty( data ), 'Must provide an object to store' ) ) {
			return; 
		}       

		/* Defaults */

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" === typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}

		key = ( !!key ) ? key : null;


		/* Context */

		var context = { "store": store, "key": key, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

		
		/* Action */

		DB.trigger( 'IndexedDB_row_put', context );


		/* Transaction */

		var transaction = DB.transaction.create( store, DB.transaction.read_write(), on_complete );


		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_row_put transaction', transaction );
		}

		//use this[ 'format' ] for function invocation to avoid a Closure compiler error
		try {


			/* Request */
			var request;
			if( !!key ) {
				request = transaction[ 'put' ]( data, key );
			} else { 
				request = transaction[ 'put' ]( data );
			}


			/* Request Responses */

			request.onsuccess = function ( event ) {	

				/* Context */

				context[ 'event' ] = event;
		
				/* Callback */

				on_success( event );

				/* Action */

				DB.trigger( 'IndexedDB_row_put_success', context );

			}

			request.onerror = function ( event ) {

				/* Context */

				context[ 'event' ] = event;
		
				/* Callback */

				on_error( event );

				/* Action */

				DB.trigger( 'IndexedDB_row_put_error', context );

			}

			request.onabort = function ( event ) {

				/* Context */

				context[ 'event' ] = event;
		
				/* Callback */

				on_abort( event );
				
				/* Action */

				DB.trigger( 'IndexedDB_row_put_abort', context );

			}

		} catch( error ) {

			/* Debug */

			if ( !!DB.debug ) {
				console.log ( 'errorType', DB.database.errorType( error.code ) );
			}

			/* Context */

			context[ 'error' ] = error;

			on_error( context );
		
		}
	}


	/* TODO: On complete */
	DB.bind( 'IndexedDB_do_cursor_get', function( row_result, context ) {
		
		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_cursor_get', row_result, context );
		}


		/* Setup */

		var store = context.store; // Required
		var index = context.index; // Optional
		var keyRange = context.keyRange; // Required
		var direction = context.direction; // Optional; defaults to DB.cursor.direction.next()
		var limit = context.limit; //Optional


		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( keyRange ), 'Must provide keyRange' ) ) {
			return;
		}


		/* Defaults */

		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();

		index = ( !DB.isEmpty( context.index ) ) ? context.index : null;

		limit = ( !DB.isEmpty( limit ) ) ? limit : null;


		/* Invocation */
		
		DB.cursor.get( store, index, keyRange, direction, limit, context.on_success, context.on_error, context.on_abort, context.on_complete );

	} );

	/* TODO: Direction? */
	DB.cursor.get = function ( store, index, keyRange, direction, limit, on_success, on_error, on_abort, on_complete ) {

		/* Debug */
		if ( !!DB.debug ) {	
			console.log ( 'DB.cursor.get', store, index, keyRange, direction, limit, on_success, on_error, on_abort, on_complete );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( 'undefined' !== typeof keyRange, 'keyRange must be an IDBKeyRange' ) ) {
			return;
		}

		/* Defaults */

		index = ( !DB.isEmpty( index ) ) ? index : null;
		
		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();
		
		limit = ( !DB.isEmpty( limit ) ) ? limit : null;
		
		if ( "undefined" == typeof on_success ) {
			on_success = DB.events.onSuccess;
		}
		
		if ( "undefined" == typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" == typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" == typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}

		/* Context */

		var context =  { "store": store, "index": index, "keyRange": keyRange, 'direction': direction, 'limit': limit, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

		/* Debug */
		
		if( !!DB.debug ) {
			console.log( 'indb.js > DB.cursor.get() > Doing IndexedDB_cursor_get', context );
		}	
		
		/* Action */

		DB.trigger( 'IndexedDB_cursor_get', context );
		
		try {

			/* Transaction */

			var transaction = DB.transaction.create ( store, DB.transaction.read_write(), on_complete );


			/* Debug */

			if ( !!DB.debug ) {
				console.log ( 'DB.cursor.get transaction', transaction, index, typeof index );
			}

			/* Request */

			var request;
			
			/* Optional Index */

			if ( !DB.isEmpty( index ) ) {

				/* Debug */

				if ( !!DB.debug ) {
					console.log ( 'transaction_index.openCursor (index)', transaction, index, keyRange );
				}

				// Using index
				var transaction_index = transaction.index( index );

				/* Request */

				request = transaction_index.openCursor( keyRange, direction );

			} else {

				/* Debug */

				if ( !!DB.debug ) {
					console.log ( 'transaction.openCursor (no index)', transaction, keyRange );
				}

				// No index

				/* Request */

				request = transaction.openCursor( keyRange, direction );

			}

			/* Request Responses */

			var total = 0;

			request.onsuccess = function ( event ) {	

				/* Debug */

				if ( !!DB.debug ) {
					console.log ( 'cursor.get result', DB.cursor.result( event ) );
					console.log ( 'cursor.value value', DB.cursor.value( event ) );
				}

				/* Context */

				context[ 'event' ] = event;

				/* Callback */

				on_success( context ); 

				/* Action */

				DB.trigger( 'IndexedDB_cursor_row_get_success', context );

				total++;

				/* Result */
				
				var result = event.target.result;

				if ( !DB.isEmpty( result ) && "undefined" !== typeof result.value ) {
					// Move cursor to next key
					if( 'undefined' == typeof limit || null == limit || total < limit ) {
						result[ 'continue' ]();
					}
				}
			}

			request.onerror = function ( event ) {	

				/* Context */

				context[ 'event' ] = event;

				/* Callback */

				on_error( context );

				/* Debug */

				if ( !!DB.debug ) {
					console.log ( 'Doing IndexedDB_cursor_row_get_error', context );
				}

				/* Action */

				DB.trigger( 'IndexedDB_cursor_row_get_error', context );

			}

			request.onabort = function ( event ) {	

				/* Context */

				context[ 'event' ] = event;

				/* Callback */

				on_abort( event );
				
				/* Debug */

				if ( !!DB.debug ) {
					console.log ( 'Doing IndexedDB_cursor_row_get_abort', context );
				}

				/* Action */

				DB.trigger( 'IndexedDB_cursor_row_get_abort', context );

			}

		} catch ( error ) {

			context[ 'error' ] = error;
			on_error( context );

			if( !!DB.debug ) {
				console.log('Error in cursor get row', error );
			}

		}
	}

	//context.store, context.index, context.keyRange (e.g. DB.range.left_open( "0" ) ), context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_cursor_update', function( row_result, context ) {
		
		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_cursor_update', row_result, context );
		}

		/* Setup */

		var direction = context.direction; // Optional; defaults to DB.cursor.direction.next()
		var limit = context.limit; // Optional; defaults to DB.cursor.direction.next()
		var store = context.store; // Required
		var index = context.index; // Optional; Defaults to null
		var keyRange = context.keyRange; // Required
		var data = context.data; // Required
		var replace = context.replace; // Optional; Defaults to false
		var expecting = context.expecting; // Optional; Defaults to null

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( data ), 'Must provide an object' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( keyRange ), 'Must provide keyRange' ) ) {
			return;
		}

		/* Defaults */

		replace = ( DB.isBoolean( replace ) ) ? replace : false;

		index = ( !DB.isEmpty( index ) ) ? index : null;

		expecting = ( !DB.isEmpty( expecting ) ) ? expecting : null;

		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();

		limit = ( !DB.isEmpty( limit ) ) ? limit : null;

		/* Invocation */

		DB.cursor.update( store, index, keyRange, data, replace, expecting, context.on_success, context.on_error, context.on_abort, context.on_complete );

	} );


	DB.cursor.update = function ( store, index, keyRange, data, direction, limit, replace, expecting, on_success, on_error, on_abort, on_complete ) {

		/* Debug */
		if ( !!DB.debug ) {
			console.log ( 'DB.cursor.update', store, index, keyRange, data, direction, limit, replace, on_success, on_error, on_abort, on_complete );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( data ), 'Must provide an object' ) ) {
			return;
		}

		if ( !DB.assert( 'undefined' !== typeof keyRange, 'keyRange must be an IDBKeyRange' ) ) {
			return;
		}

		/* Defaults */

		replace = ( DB.isBoolean( replace ) ) ? replace : false;

		index = ( !DB.isEmpty( index ) ) ? index : null;
		
		expecting = ( !DB.isEmpty( expecting ) ) ? expecting : null;

		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();

		limit = ( !DB.isEmpty( limit ) ) ? limit : null;

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" === typeof on_complete ) {
			on_abort = DB.events.onComplete;
		}


		/* Context */

		var context = { "store": store, "keyRange": keyRange, "index": index, "data": data, 'direction': direction, 'limit': limit, "replace": replace, "expecting": expecting, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

		/* Action */

		DB.trigger( 'IndexedDB_cursor_update', context );
		
		/* Transaction */

		var transaction = DB.transaction.create( store, DB.transaction.read_write(), on_complete );


		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.cursor.update transaction', transaction, index, typeof index );
		}

		/* Request */

		var request;

		/* Optional Index */

		if ( "undefined" !== typeof index && !DB.isEmpty( index ) ) {

			/* Debug */

			if ( !!DB.debug ) {
				console.log ( 'transaction_index.openCursor', index, keyRange );
			}
			
			// Using index
			var transaction_index = transaction.index( index );
		
			/* Request */
		
			request = transaction_index.openCursor( keyRange, direction );

		} else {

			/* Debug */

			if ( !!DB.debug ) {
				console.log ( 'transaction.openCursor', keyRange, direction );

			}

			// No index

			/* Request */

			request = transaction.openCursor( keyRange, direction );

		}
		
		/* Request Responses */

		request.onsuccess = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_success( context );

			/* Action */

			DB.trigger( 'IndexedDB_cursor_row_update_success', context );

			/* Update */

			var cursor = DB.row.value( context.event );
			var result = DB.cursor.value( context.event );
			var instance_data = {};
			if( 'function' == typeof data ) {
				var result_value = result;
				instance_data = data( result_value );
				if( !!Neural.debug ) {
					console.log('Neural.synapses.cursor.update', JSON.stringify( instance_data ) );
				}
			}
			if( false == replace && null !== result && 'undefined' !== result ) {	
				var temp_data = instance_data;
				for( attr in result ) {
					var value = instance_data[ attr ];
			
					if( 'function' == typeof value ) {
						value = value( result[ attr ] );
					}
					if( 'undefined' !== typeof expecting && null !== expecting && 'undefined' !== result[ attr ] && 'undefined' !== typeof expecting[ attr ] && null !== expecting[ attr ] ) {

						if( result[ attr ] !== expecting[ attr ] ) {

							if( !!DB.debug ) {
								console.log( 'DB.row.update > value was not expected.', result[ attr ], expecting[ attr ] );
							}

							var err = new Error( 'Found ' + result[ attr] + ', expecting ' + expecting[ attr ] );
							context[ 'event' ] = err;

							on_error( context );

						}

					}
					if( 'undefined' !== typeof value ) {
						temp_data[ attr ] = value;
					} else {
						temp_data[ attr ] = result[ attr ];
					}
				}
				instance_data = temp_data;
			}


			/* Debug */

			if ( !!DB.debug ) {
				console.log ( 'DB.cursor.update context.data data', instance_data );
			}
			if ( "undefined" !== typeof cursor && null !== cursor ) {
				if( 'undefined' == typeof limit || null == limit || total < limit ) {
					cursor[ 'update' ]( instance_data );

				}
				cursor[ 'continue' ]();
			}
		}

		request.onerror = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_error( context );

			/* Action */

			DB.trigger( 'IndexedDB_cursor_row_update_error', context );

		}

		request.onabort = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_abort( context );

			/* Action */

			DB.trigger( 'IndexedDB_cursor_row_update_abort', context );

		}

	}


	//context.database, context.index, context.keyRange (e.g. DB.range.left_open( "0" ) ), context.on_success, context.on_error, context.on_abort
	DB.bind( 'IndexedDB_do_cursor_delete', function( row_result, context ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'IndexedDB_do_cursor_delete', row_result, context );
		}

		/* Setup */

		var store = context.store; // Required
		var keyRange = context.keyRange; // Required
		var index = context.index; // Required
		var direction = context.direction; // Optional; defaults to DB.cursor.direction.next()
		var limit = context.limit;

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( !DB.isEmpty( keyRange ), 'Must provide keyRange' ) ) {
			return;
		}

		/* Defaults */

		index = ( !DB.isEmpty( index ) ) ? index : null;
		
		limit = ( !DB.isEmpty( limit ) ) ? limit : null;

		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();

		/* Invocation */

		DB.cursor.delete( store, index, keyRange, direction, limit, context.on_success, context.on_error, context.on_abort, context.on_complete );

	} );

	DB.cursor.delete = function ( store, index, keyRange, direction, limit, on_success, on_error, on_abort, on_complete ) {

		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.cursor.get', store, index, keyRange, on_success, on_error, on_abort, on_complete );
		}

		/* Assertions */

		if ( !DB.assert( !DB.isEmpty( store ), 'Must provide an object store' ) ) {
			return;
		}

		if ( !DB.assert( 'undefined' !== typeof keyRange, 'keyRange must be an IDBKeyRange' ) ) {
			return;
		}

		/* Defaults */

		index = ( !DB.isEmpty( index ) ) ? index : null;

		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();

		limit = ( !DB.isEmpty( limit ) ) ? limit : null;

		if ( "undefined" === typeof on_success ) {
			on_success = DB.events.onSuccess;
		}

		if ( "undefined" === typeof on_error ) {
			on_error = DB.events.onError;
		}

		if ( "undefined" === typeof on_abort ) {
			on_abort = DB.events.onAbort;
		}

		if ( "undefined" === typeof on_complete ) {
			on_complete = DB.events.onComplete;
		}


		/* Context */

		var context = { "store": store, "keyRange": keyRange, "index": index, 'direction': direction, 'limit': limit, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

		/* Action */
		
		DB.trigger( 'IndexedDB_cursor_delete', context );

		/* Transaction */

		var transaction = DB.transaction.create( store, DB.transaction.read_write(), on_complete );


		/* Debug */

		if ( !!DB.debug ) {
			console.log ( 'DB.cursor.get transaction', transaction, index, typeof index );
		}

		/* Request */

		var request;
		
		/* Optional Index */

		if ( "undefined" !== typeof index && !DB.isEmpty( index ) ) {

			/* Debug */

			if ( !!DB.debug ) {
				console.log ( 'DB.cursor.get transaction_index.openCursor', index, keyRange, direction );
			}

			// Using index
			var transaction_index = transaction.index( index );

			/* Request */
			request = transaction_index.openCursor( keyRange, direction );

		} else {

			/* Debug */

			if ( !!DB.debug ) {
				console.log ( 'DB.cursor.get transaction.openCursor', keyRange, direction );
			}
			
			// No index

			/* Request */
			request = transaction.openCursor( keyRange, direction );

		}

		/* Request Responses */

		var total = 0;

		request.onsuccess = function ( event ) {	

			/* Context */
			
			context[ 'event' ] = event;

			/* Callback */

			on_success( context );

			total++;

			/* Action */

			DB.trigger( 'IndexedDB_cursor_row_delete_success', context );

			/* Result */

			var cursor = event.target.result;
			var cursor_result = DB.cursor.value( cursor );
			if ( "undefined" !== typeof cursor && null !== cursor && "undefined" !== typeof cursor_result ) {
				if( 'undefined' == typeof limit || null == limit || total < limit ) {
					cursor[ 'continue' ]();
					cursor[ 'delete' ]();
				}
			}
		}
		request.onerror = function ( event ) {	
		
			/* Context */
			
			context[ 'event' ] = event;
		
			/* Callback */

			on_error( context );
			
			/* Action */

			DB.trigger( 'IndexedDB_cursor_row_delete_error', context );

		}

		request.onabort = function ( event ) {	
		
			/* Context */
			
			context[ 'event' ] = event;
		
			/* Callback */

			on_abort( context );
			
			/* Action */

			DB.trigger( 'IndexedDB_cursor_row_delete_abort', context );

		}

	}

	/* Utilities */

	DB.utilities.random = function( length, type ) {
		var set = new String();
		if( 'numbers' !== type ) {
			set += 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
		}
		if( 'string' !== type && 'letters' !== type ) {
			set += '0123456789';
		}
		var random = '';
		for ( var i=0; i < length; i++ ) {
			var random_pos = Math.floor( Math.random() * set.length );
			random += set.substring( random_pos, random_pos + 1 );
		}
		return random;
	}

	/* End Functions */


	/* PUBLIC API */

	/* Constructor */

	var IndexedDB = function( request ) {
		console.log("OK", arguments);
		sleep( 2000 );
		// Fix browser if necessary 
		var browser_check = DB.checkBrowser(); 
		DB.assert( -1 !== browser_check, 'incompatible browser' ); 
		if ( 0 === browser_check ) { 
			DB.fixBrowser(); 
		}

		if( 'undefined' !== typeof request.store ) {
			current_store = request.store;
		}

		var on_success = function( database ) {
			request.target = database;
			if( 'function' == typeof request.on_success ) {
				request.on_success( database );
			}
		};

		var on_error = function( context ) {
			if( 'function' == typeof request.on_success ) {
				request.on_error( context );
			}
		};

		DB.trigger( 'IndexedDB_do_database_load', { 'name': request.database, 'description': request.description, 'on_success': on_success, 'on_error': on_error } ) ;

		return this;
	};

	/* Database */

	IndexedDB.prototype.install = function ( request ) {

		var namespace = {};
	
		if( !DB.assert( 'undefined' !== typeof request, 'Request cannot be empty' ) ) {
			return this;
		}

		var store = request.store;
		store = ( !DB.isEmpty( store ) ) ? store : current_store;

		var indexes = request.indexes;
	
		namespace[ store ] = { 'key': DB.shorthand.get( { 'store': store, 'key': request.indexes.primary.key } ), 'incrementing_key': request.indexes.primary.incrementing, 'unique': request.indexes.primary.unique }

		delete request.indexes.primary;

		var namespace_idxs = {};
		namespace_idxs[ store ] = {};

		for( index in indexes ) {
			namespace_idxs[ store ][ index ] = {};
			namespace_idxs[ store ][ index ][ DB.shorthand.get( { 'store': store, 'key': index } ) ] = indexes[ index ];
		}

		DB.trigger( 'IndexedDB_do_stores_create', { 'stores': namespace, 'on_success': function( context ) {
			DB.trigger( 'IndexedDB_do_indexes_create', { 'indexes': namespace_idxs, 'on_complete': function( context2 ) {
				console.log( 'Store loaded', context2 );
			} } );
		} } );

		return this;

	}

	/* Methods */

	/* Relationship helpers */

	/*
	Each takes an object w/attributes { options: obj, on_success: fn, on_error: fn }
	*/

	IndexedDB.prototype.cursor =IndexedDB.prototype.cursor || {};

	/* Synapses Set */
	IndexedDB.prototype.setAttr = function( request ) {

		if( !IndexedDB.debug ) {
			console.log( 'IndexedDB.prototype.setAttr', request );
		}

		var on_success =  function( context ) {
			if( !IndexedDB.debug ) {
				console.log( 'IndexedDB.prototype.setAttr success', context );
			}
			if( 'function' == typeof request.on_success ) {
				request.on_success( context );
			}
		};

		var on_error =  function( context ) {
			if( !IndexedDB.debug ) {
				console.log( 'IndexedDB.prototype.setAttr error', context );
			}
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};
		
		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		/* Request */

		var data = {};
		data[IndexedDB.prototype.shorthand( request.attribute ) ] = request.strength;

		var update_request = {};
		for( attr in request ) {
			update_request[ attr ] = request[ attr ];
		}

		update_request.on_success = on_success;
		update_request.on_error = on_error;

	IndexedDB.prototype.update( update_request );

		return this;

	};

	/* Synapses Get */
	// ( 'key': string, 'index': string (requred), 'strength': int, 'on_success': fn, 'on_error': fn }
	IndexedDB.prototype.getAttr = function( request ) {
		
		var on_success =  function( value ) {
			if( !IndexedDB.debug ) {
				console.log( 'IndexedDB.prototype.setAttr success', context );
			}
			if( 'function' == typeof request.on_success ) {
				var result = ( 'undefined' !== typeof result ) ? value[ request.attribute ] : null;
				request.on_success( result );
			}
		};

		var on_error =  function( context ) {
			if( !IndexedDB.debug ) {
				console.log( 'IndexedDB.prototype.getAttr error', context );
			}
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		var get_request = {};
		for( attr in request ) {
			get_request[ attr ] = request[ attr ];
		}

		get_request.on_success = on_success;
		get_request.on_error = on_error;

	IndexedDB.prototype.get( get_request );

		return this;

	};

	/* Synapses Cursor set */
	// ( 'key': string, 'index': string (requred), 'strength': int, 'on_success': fn, 'on_error': fn }
	IndexedDB.prototype.cursor.setAttr = function( request ) {
		
		var on_success =  function( context ) {
			console.log( 'IndexedDB.prototype.cursor.setAttr success', context );
		};

		var on_error =  function( context ) {
			console.log( 'IndexedDB.prototype.cursor.setAttr', context );
		};

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		var db_request = {};
		for( attr in request ) {
			db_request[ attr ] = request[ attr ];
		}

		db_request.on_success = on_success;
		db_request.on_error = on_error;

		db_request.data[IndexedDB.prototype.shorthand( request.attribute ) ] = request.strength;
		
	IndexedDB.prototype.cursor.update( db_request );
		
		return this;
	};

	/* Synapses Cursor get */
	IndexedDB.prototype.cursor.getAttr = function( request ) {
		
		var on_success =  function( context ) {
			console.log( 'IndexedDB.prototype.setAttr success', context );
			var value = DB.cursor.value( context.event );
			request.on_success( value[ request.attribute ] );
		};

		var on_error =  function( context ) {
			console.log( 'IndexedDB.prototype.setAttr error', context );
			request.on_error( context );
		};

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		var db_request = {};
		for( attr in request ) {
			db_request[ attr ] = request[ attr ];
		}

		db_request.on_success = on_success;
		db_request.on_error = on_error;

	IndexedDB.prototype.get( db_request );
		return this;
	};




	/* Single */

	/* Get */
	IndexedDB.prototype.get = function ( request )  {

		if( !IndexedDB.debug ) {
			console.log( 'IndexedDB.prototype.get', request );
		}

		var on_success = function( context ) {
			if( 'function' == typeof request.on_success ) {
				var value =IndexedDB.prototype.shorthand_decode( DB.row.value( context ) );
				request.on_success( value );
			}
		}

		var on_error = function( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		}

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		DB.trigger( 'IndexedDB_do_row_get', { 'store': request.store, 'key': request.key, 'index': request.index, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		return this;

	}

	/* Remove */
	IndexedDB.prototype.delete = function ( request ) {

		if( !IndexedDB.debug ) {
			console.log( 'IndexedDB.prototype.delete', request );
		}

		var on_success = function( context ) {
			if( 'function' == typeof request.on_success ) {
				var value = DB.row.value( context );
				request.on_success( value );
			}
		}

		var on_error = function( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		}

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		DB.trigger( 'IndexedDB_do_row_delete', { 'store': request.store, 'key': request.key, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		return this;

	}

	/* Put */
	IndexedDB.prototype.put = function ( request )  {

		if( !IndexedDB.debug ) {
			console.log( 'IndexedDB.prototype.put', request );
		}

		var on_success = function( context ) {
			if( 'function' == typeof request.on_success ) {
				var value = DB.row.value( context );
				request.on_success( value );
			}
		}

		var on_error = function( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		}

		var data = request.data;
		if( 'function' !== typeof data ) {
			data =IndexedDB.prototype.shorthand_encode( data );
		}

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		DB.trigger( 'IndexedDB_do_row_put', { 'store': request.store, 'data': data, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		return this;

	}

	/* Add */
	IndexedDB.prototype.add = function ( request )  {
		
		if( !IndexedDB.debug ) {
			console.log( 'IndexedDB.prototype.add', request );
		}

		var on_success = function( context ) {
			if( 'function' == typeof request.on_success ) {
				var value = DB.row.value( context );
				request.on_success( value );
			}
		};

		var on_error = function( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};

		var data = request.data;
		if( 'function' !== typeof data ) {
			data =IndexedDB.prototype.shorthand_encode( data );
		}

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		DB.trigger( 'IndexedDB_do_row_add', { 'store': request.store, 'data': data, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		return this;

	}

	/* Update */
	IndexedDB.prototype.update = function ( request ) {

		if( !IndexedDB.debug ) {
			console.log( 'IndexedDB.prototype.update', request );
		}

		var on_success = function( context ) {
			if( 'function' == typeof request.on_success ) {
				var value = DB.row.value( context );
				request.on_success( value );
			}
		}

		var on_error = function( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		}

		var data = request.data;
		var new_data;
		if( 'function' !== typeof data ) {
			new_data =IndexedDB.prototype.shorthand_encode( data );
		} else {
			new_data = function( arg ) {
				returnIndexedDB.prototype.shorthand_encode( data(IndexedDB.prototype.shorthand_decode( arg ) ) );
			};
		}

		var expected = request.expected;
		if( 'function' !== typeof expected ) {
			expected =IndexedDB.prototype.shorthand_encode( expected );
		}

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		DB.trigger( 'IndexedDB_do_row_update', { 'store': request.store, 'key': request.key, 'index': request.index, 'data': new_data, 'replace': request.replace, 'expected': expected, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		return this;

	}

	/* Multi */

	IndexedDB.prototype.cursor =IndexedDB.prototype.cursor || {};

	/* Cursor Get */
	IndexedDB.prototype.cursor.get = function( request ) {

		/* Action */

		var index = request.index;
		var direction = request.direction;
		var limit = request.limit;
		var key = request.key;
		var begin = request.begin;
		var end = request.end;
		var left_inclusive = request.left_inclusive;
		var right_inclusive = request.right_inclusive;

		if( !IndexedDB.debug ) {
			console.log( 'IndexedDB.prototype.cursor.get', request );
		}

		jQuery(document).trigger('cursor_get_namespace',request);


		/* Defaults */
		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();
		limit = ( 'undefined' !== typeof limit ) ? limit : null;
		begin = ( 'undefined' !== typeof begin ) ? begin : null;
		end = ( 'undefined' !== typeof end ) ? end : null;
		left_inclusive = ( 'undefined' !== typeof left_inclusive ) ? left_inclusive : null;
		right_inclusive = ( 'undefined' !== typeof right_inclusive ) ? right_inclusive : null;
		key = ( 'undefined' !== typeof begin && 'undefined' !== typeof end ) ? key : null;


		/* Setup */

		var keyRange = DB.range.get( key, begin, end, left_inclusive, right_inclusive );


		/* Callbacks */

		var on_success = function ( context ) {
			var item =IndexedDB.prototype.shorthand_reverse( DB.cursor.value( context.event ) );
			console.log('blah',item);
			if( 'function' == typeof request.on_success ) {
				if( !IndexedDB.debug ) console.log( 'success', item );
				request.on_success( item );
			}
		};

		var on_error = function ( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		/* Request */

		DB.trigger( 'IndexedDB_do_cursor_get', { 'store': request.store, 'keyRange': keyRange, 'index': index, 'direction': direction, 'limit': limit, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		return this;

	}

	/* Cursor Delete */
	IndexedDB.prototype.cursor.delete = function( request ) {

		/* Setup */

		var index = request.index;
		var direction = request.direction;
		var limit = request.limit;
		var key = request.key;
		var begin = request.begin;
		var end = request.end;
		var left_inclusive = request.left_inclusive;
		var right_inclusive = request.right_inclusive;

		/* Callbacks */

		var on_success = function ( context ) {
			var result = DB.cursor.value( context.event );
			if( 'function' == typeof request.on_success ) {
				request.on_success( result );
			}
		};

		var on_error = function ( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};


		/* Action */

		jQuery(document).trigger('cursor_delete_namespace', { "index": index, "key": key, 'direction': direction, 'limit': limit, "begin": begin, "end": end, "left_inclusive": left_inclusive, "right_inclusive": right_inclusive, "on_success": on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );


		/* Defaults */

		begin = ( 'undefined' !== typeof begin ) ? begin : null;
		end = ( 'undefined' !== typeof end ) ? end : null;
		left_inclusive = ( 'undefined' !== typeof left_inclusive ) ? left_inclusive : null;
		right_inclusive = ( 'undefined' !== typeof right_inclusive ) ? right_inclusive : null;
		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();
		limit = ( 'undefined' !== typeof limit ) ? limit : null;
		key = ( 'undefined' !== typeof begin && 'undefined' !== typeof end ) ? key : null;

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		/* Setup */

		var keyRange = DB.range.get( key, begin, end, left_inclusive, right_inclusive );

		/* Request */

		DB.trigger( 'IndexedDB_do_cursor_delete', { 'store': request.store, 'keyRange': keyRange, 'index': index, 'direction': direction, 'limit': limit, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		return this;

	};

	/* Cursor Update */
	IndexedDB.prototype.cursor.update = function( request ) {

		/* Setup */

		var index = request.index;
		var direction = request.direction;
		var limit = request.limit;
		var key = request.key;
		var data = request.data;
		var replace = request.replace;
		var begin = request.begin;
		var end = request.end;
		var data = request.data;
		var left_inclusive = request.left_inclusive;
		var right_inclusive = request.right_inclusive;

		/* Callbacks */

		var on_success = function ( context ) {
			var item =IndexedDB.prototype.shorthand_reverse( DB.cursor.value( context.event ) );
			if( 'function' == typeof request.on_success ) {
				request.on_success( item );
			}
		};

		var on_error = function ( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};


		/* Shorthand Encoding */
		var new_data;
		if( 'function' !== typeof data ) {
			new_data =IndexedDB.prototype.shorthand_encode( data );
		} else {
			new_data = function( arg ) {
				returnIndexedDB.prototype.shorthand_encode( data(IndexedDB.prototype.shorthand_decode( arg ) ) );
			};
		}

		/* Action */

		jQuery(document).trigger( 'cursor_update_namespace', { 'data': new_data, "index": index, "key": key, "begin": begin, "end": end, "left_inclusive": left_inclusive, "right_inclusive": right_inclusive, "replace": replace, 'direction': direction, 'limit': limit, "on_success": on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );

		/* Defaults */

		replace = ( true == replace ) ? true : false;
		direction = ( DB.cursor.isDirection( direction ) ) ? direction : DB.cursor.direction.next();
		limit = ( 'undefined' !== typeof limit ) ? limit : null;
		begin = ( 'undefined' !== typeof begin ) ? begin : null;
		end = ( 'undefined' !== typeof end ) ? end : null;
		left_inclusive = ( 'undefined' !== typeof left_inclusive ) ? left_inclusive : null;
		right_inclusive = ( 'undefined' !== typeof right_inclusive ) ? right_inclusive : null;
		key = ( 'undefined' !== typeof begin && 'undefined' !== typeof end ) ? key : null;

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		/* Setup */

		var keyRange = DB.range.get( key, begin, end, left_inclusive, right_inclusive );

		/* Request */
		
		DB.trigger( 'IndexedDB_do_cursor_update', { 'store': request.store, 'data': new_data, 'keyRange': keyRange, 'index': index, 'replace': replace, 'direction': direction, 'limit': limit, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort, 'on_complete': request.on_complete } );
	
		return this;

	}

	IndexedDB.prototype.clear = function( request ) {

		/* Callbacks */

		var on_success = function ( value ) {
			if( 'function' == typeof request.on_success ) {
				request.on_success( value );
			}
		};

		var on_error = function ( context ) {
			if( 'function' == typeof request.on_error ) {
				request.on_error( context );
			}
		};

		/* Defaults */

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		DB.trigger( 'IndexedDB_do_store_clear', { 'store': request.store, 'on_success': on_success, 'on_error': on_error, 'on_abort': request.on_abort } );
	
		return this;

	};

	IndexedDB.prototype.shorthand =IndexedDB.prototype.shorthand || {};

	IndexedDB.prototype.shorthand.set = function( request ) {

		var store = request.store;
		var data = request.data;
		var on_error = request.on_error;
		var shorthand_map = DB.shorthand.map.get( { 'store': store } );
		if( 'undefined' !== typeof request.replace && false === request.replace ) {
			for( item in data ) {
				shorthand_map[ item ] = data[ item ];
			}
		} else {
			shorthand_map = data;
		}

		/* Defaults */

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		DB.shorthand.map.set( { 'store': store, 'data': shorthand_map, 'on_success': request.on_success, 'on_error': request.on_error } );

		return this;

	};

	IndexedDB.prototype.shorthand.get = function( request ) {

		/* Defaults */

		var store = request.store;
		request.store = ( !DB.isEmpty( store ) ) ? store : current_store;

		var shorthand_map = DB.shorthand.map.get( { 'store': request.store } );
		if ( 'undefined' === shorthand_map ) {
			var on_success = request.on_success;
			if( 'function' === typeof on_success ) {
				on_success( result );
			}		return shorthand_map;
			var result = ( 'undefined' !== typeof request.key ) ? shorthand_map : shorthand_map[ request.key ];
			if ( 'undefined' === typeof result ) {
				result = null;		
			}
			var on_success = request.on_success;
			if( 'function' === typeof on_success ) {
				on_success( result );
			}
		}
		return this;	
	};

	return IndexedDB;

} )(); // End immediately executing anonymous function
