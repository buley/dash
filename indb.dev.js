/**
 * InDB by Taylor Buley
 * Github -> http://github.com/editor/indb 
 * Twitter -> @taylorbuley
 **/

/**
 * Namespaces:
 *   Indb - application namespace
 *   Indb.db - namespace for the open IndexedDB instance (IDBFactory)
 *   Indb.dbs = namespace for open databases (reserved)
 *   Indb.database - namepspace for database methods (IDBDatabase)
 *   Indb.store - namespace for operations against multiple object stores (IBObjectStore)
 *   Indb.stores - namespace for single object stores (IDBObjectStore)
 *   Indb.index - namespace for index methods (IDBIndex)
 *   Indb.transaction - namespace for key range methods (IDBTransaction)
 *   Indb.range - namespace for key range methods (IDBKeyRange)
 *   Indb.row - namespace for row methods
 *   Indb.cursor - namespace for rows methods (IDBCursor)
 *   Indb.event - namespace for event and error methods (IDBEvent, IDBSuccessEvent, IDBErrorEvent, IDBDatabaseError and IDBDatabaseException)
 *   Indb.events - namespace for event callbacks
 **/

/* Begin Namespaces */
var InDB = {};
InDB.factory = {};
InDB.db = {};
InDB.dbs = {};
InDB.database = {};
InDB.store = {};
InDB.stores = {};
InDB.index = {};
InDB.indexes = {};
InDB.range = {};
InDB.row = {};
InDB.cursor = {};
InDB.event = {};
InDB.events = {};
InDB.transaction = {};
InDB.utilities = {};
/* End Namespaces */


/**
 * Constants:
 *   None
 **/

/* Begin Constants */
/* End Constants */


/**
 * Defaults:
 *   InDB.database.version (int) - database version to start with
 *   InDB.debug (bool) - whether or not to console.log stuff
 *   InDB.events.on_success (function) - generic success callback
 *   InDB.events.onComplete (function) - generic complete callback
 *   InDB.events.onError (function)- generic error callback
 *   InDB.events.onAbort (function) - generic abort callback
 */

/* Begin Defaults */

InDB.database.version = 1;

InDB.debug = false;

InDB.events.onComplete = function ( e ) {
	if ( !!InDB.debug ) {
		console.log ( "IndexedDB request completed", e );
	}
};

InDB.events.onSuccess = function ( e ) {
	if ( !!InDB.debug ) {
		console.log ( "IndexedDB request successful", e );
	}
};

InDB.events.onError = function ( e ) {
	if ( !!InDB.debug ) {
		console.log ( "IndexedDB request errored", e );
	}
};

InDB.events.onAbort = function ( e ) {
	if ( !!InDB.debug ) {
		console.log ( "IndexedDB request aborted", e );
	}
};

InDB.events.onBlocked = function ( e ) {
	if ( !!InDB.debug ) {
		console.log ( "IndexedDB request blocked", e.event.target.result );
	}
};

/* End Defaults */

/* Begin Onload */
//jQuery document.load callback TK
/* End Onload */


/**
 * Actions:
 *  InDB_database_loaded - The database is loaded into the InDB.db namespace; no guarantee that object stores exist if a fresh install
 *  InDB_database_created - Database is created for the first time
 *  InDB_stores_load_{success|error|abort} - Database is loaded and all collections have been created
 *  InDB_store_created_{success|error|abort} - Response to an attempt at creating an object store
 *  InDB_database_already_loaded - a specific type of InDB_database_load_error
 *  InDB_store_already_exists - a specific type of InDB_store_created_error
 **/
 /* End Actions */

/* Begin Functions */

/* Begin Event Methods */

/* binds a callback method to new events */
InDB.bind = function ( event_name, callback_method ) {
	//TODO: assert argument types and validity
	jQuery( InDB ).bind( event_name, callback_method );
}

/* triggers a new event */
InDB.trigger = function ( event_name, context ) {
	//TODO: assert argument types and validity
	jQuery( InDB ).trigger( event_name, context );
}


/* Begin InDB Methods */
/**
 * InDB.browserSupported( )  > support level (int): [ -1, 0, 1 ]
 *  Checks to see if IndexedDB is supported
 *  returns 1 if fully supported, 0 if supported w/fixes, and -1 if unsupported
 **/

/* Create object stores after the database is created */
InDB.bind( 'InDB_do_database_load', function ( event, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_database_load', event, context );
	}

	/* Setup */

	var name = context.name;
	var description = context.description;
	var on_success = context.on_success;
	var on_error = context.on_error;
	var on_abort = context.on_abort;

	/* Assertions */

	// Assert that the database has a name
	if ( !InDB.assert( !InDB.isEmpty( name ), 'Database must have a name' ) ) {
		return;
	}

	/* Request */

	InDB.database.load( name, description, on_success, on_error, on_abort );

} );




/* Bug (sort of): The InDB.db namespace means that it works with only one 
 * IndexedDB database at a time. */
/* This function is indempodent (you can run it multiple times and it won't do anything */
InDB.database.load = function ( name, description, on_success, on_error, on_abort ) {

	/* Begin Debug */
	if ( !!InDB.debug ) {
		console.log ( "InDB.database.load", name, description, on_success, on_error, on_abort );
	}
	/* End Debug */

	var context = { "name": name, "description": description, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };


	/* Assertions */	
	
	if ( "IDBDatabase" === typeof InDB.db && name === InDB.db.name ) {
		on_error( new Error( "Database already loaded" ) );
		InDB.trigger( 'InDB_database_already_loaded', context );
		return;
	}
		
	if ( !InDB.assert( !InDB.isEmpty( name ), "database name cannot be empty" ) ) { 
		return;
	}
	
	if ( !InDB.assert( !InDB.isEmpty( description ), "database description cannot be empty" ) ) { 
		return;
	}

	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	
	/* Action */
	InDB.trigger( 'InDB_database_loading', context );
	
	/* Request Responses */

	if ( "undefined" !== typeof InDB.db && name === InDB.db.name ) {
		InDB.trigger( 'InDB_database_load_success', context );
		InDB.trigger( 'InDB_stores_load_success', context );
	} else {
		var open_request = window.indexedDB.open( name, description );
		open_request.onsuccess = function ( event ) {
			InDB.db = event.target.result;
			context[ 'event' ] = event;
			on_success( context );
			if ( isNaN( InDB.db.version ) ) {
				InDB.trigger( 'InDB_database_load_success', context );
				InDB.trigger( 'InDB_database_created_success', context );
				/* Database is unversioned, so create object stores */
				InDB.trigger( 'InDB_stores_load_success', context );
			} else {
				InDB.trigger( 'InDB_database_load_success', context );
				InDB.trigger( 'InDB_stores_load_success', context );
			}
		}
		open_request.onerror = function ( event ) {
			context[ 'event' ] = event;
			on_error( context );
			InDB.trigger( 'InDB_database_load_error' );
		}
		open_request.onabort = function ( event ) {
			context[ 'event' ] = event;
			on_abort( context );
			InDB.trigger( 'InDB_database_load_error' )
		}
	}
}

InDB.checkBrowser = function () {
	InDB.trigger( 'InDB_checking_browser' );		
	var result = -1;
	// the support check
	if ( !!window.webkitIndexedDB || !!window.mozIndexedDB ) {
		result = 0;
	} else if (!!window.indexedDB ) {
		result = 1;
	}
	//TODO: Allow filter
	//result = InDB.trigger( 'Indb_did_browserSupported', { "result": result } );
	InDB.trigger( 'InDB_checked_browser', { "result": result } );
	return result;
}

/**
 * InDB.assert( statement, string, string ) - handy little tool for unit tests
 * statement (mixed): whatever you want to evaluate
 * warn_level (string): log, alert or *error (*default) 
 *
 **/
InDB.assert = function ( statement, error_message, warn_level ) {

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



InDB.exists = function( mixed_var ) {
	return ( InDB.isEmpty( mixed_var ) ) ? false : true;
};

/* InDB.isEmpty ( mixed var ) -> bool
 * Checks whether a variable has a value */
InDB.isEmpty = function ( mixed_var ) {
	if ( !!InDB.debug && "verbose" === InDB.debug ) {
		console.log ( '"undefined" !== typeof mixed_var', "undefined" !== typeof mixed_var );
		console.log ( 'null !== mixed_var', null !== mixed_var );
		console.log ( '"" !== mixed_var', "" !== mixed_var );
		console.log ( '!!mixed_var', !!mixed_var );
	}
	return ( "undefined" !== typeof mixed_var && null !== mixed_var && "" !== mixed_var ) ? false : true;
}

InDB.isObject = function ( mixed_var ) {
	return InDB.isType( "object", mixed_var );
}

InDB.isString = function ( mixed_var ) {
	return InDB.isType( "string", mixed_var );
}

InDB.isFunction = function ( mixed_var ) {
	return InDB.isType( "function", mixed_var );
}

InDB.isNumber = function ( mixed_var ) {
	return InDB.isType( "number", mixed_var );
}

InDB.isBoolean = function ( mixed_var ) {
	return InDB.isType( "boolean", mixed_var ) || 'true' == mixed_var || 'false' == mixed_var;
}

InDB.isType = function ( type, mixed_var ) {
	return ( type !== typeof mixed_var ) ? false : true;
}

/* InDB.fixBrowser( ) -> null 
 * Sets up expermental interfaces if necessary. For use when a browser has not yet implemented the native (window.IndexedDB) dom interface, which is detectable if InDB.browser_supported returns -1. */
InDB.fixBrowser = function () {
	InDB.trigger( 'doing_fixBrowser' );		
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

/* End InDB Methods */

InDB.index.exists = function ( store, index ) {
	if( !!InDB.debug ) {
		console.log( 'InDB.index.exists', store, index );
	}
	var store = InDB.transaction.create( store );
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

InDB.store.exists = function ( name ) {
/*	if( "function" === typeof InDB.db.objectStores.contains ) {
		return InDB.db.objectStores[ 'contains' ]( name ); //TODO: #Question: Not in IndexedDB spec?
	} */
	for( i=0; i<InDB.db.objectStoreNames.length; i++ ) {
		if ( name === InDB.db.objectStoreNames[i] ) {
			return true;
		}
	}
	return false;
}



/* Create object stores after the database is created */
InDB.bind( 'InDB_do_stores_create', function ( event, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_create_stores', event, context );
	}

	/* Setup */

	var stores = context.stores;
	var on_success = context.on_success;
	var on_error = context.on_error;
	var on_abort = context.on_abort;

	/* Assertions */

	// Assert that the database is already loaded
	if ( !InDB.assert( InDB.db !== 'Object', 'Database not loaded' ) ) {
		if ( !!InDB.debug ) {
			console.log ( 'Database created', event, context );
		}
	}

	/* Request */

	InDB.stores.create( stores, on_success, on_error, on_abort );

} );


InDB.stores.create = function ( stores, on_success, on_error, on_abort ) {

	var context = { 'stores': stores, 'on_success': on_success, 'on_error': on_error, 'on_abort': on_abort }; 
	//TODO: Assertions
	for( store in stores ) {

		var options = stores[ store ];

		if ( InDB.isString( options ) ) {
			/* options object is really a string
                         * recast options var from a string to a
                         * real deal options object */
			options = InDB.store.options( options );
		}
		if ( !InDB.store.exists( store ) ) {
			/* Setup */
			if( !!InDB.debug ) {
				console.log('Store doesn\'t yet exist', store, options  );
			}
			//TODO: Cleanup; if/else logic here is a little muddy (why the empty_key var?)
			var key, autoinc_key, empty_key, unique;
			if( "undefined" !== typeof options && !InDB.isEmpty( options.key ) ) {
				key = options.key;
				unique = options.unique;
				autoinc_key = options.incrementing_key;
				empty_key = InDB.isEmpty( key );
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

			if ( "undefined" === typeof unique || !InDB.isBoolean( unique ) ) { 
				unique = false; 
			}

			if ( "undefined" === typeof autoinc_key || !InDB.isBoolean( autoinc_key ) ) { 
				autoinc_key = false; 
			}

			/* Assertions */

			InDB.assert( ( empty_key || InDB.isString( key ) ), 'Key needs to be a string' );
			InDB.assert( ( InDB.isBoolean( autoinc_key ) ), 'Autoinc_key (whether the key uses a generator) needs to be a boolean' ); 

			/* Debug */

			if( !!InDB.debug ) {
				console.log( 'InDB.stores.create calling InDB.store.create', store, key, autoinc_key, on_success, on_error, on_abort );
			}

			/* Request */
				
			InDB.store.create( store, key, autoinc_key, unique, on_success, on_error, on_abort );

		}
	}
};


InDB.store.options = function ( key, autoinc_key ) {
	//TODO: Assertions key is valid string; autoinc_key is bool (isBoolean?)
	var obj = { 
		'keyPath': ( !!key ) ? key : null
		//, autoIncrement: ( !!key && autoinc_key ) ? true : false
	};
	return obj;
}

/* Create object stores after the database is created */
InDB.bind( 'InDB_do_store_create', function ( event, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_create_store', event, context );
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
	if ( !InDB.assert( InDB.db !== 'Object', 'Database not loaded' ) ) {
		if ( !!InDB.debug ) {
			console.log ( 'Database created', event, context );
		}
	}

	/* Request */
	
	InDB.store.create( name, key, autoinc_key, unique, on_success, on_error, on_abort, on_blocked );

} );


/* return true if request is successfully requested (no bearing on result)
/* autoinc_key defaults to false if a key is specified;
   key gets set to "key" and autoincrements when key is not specified */
InDB.store.create = function ( name, key, autoinc_key, unique, on_success, on_error, on_abort, on_blocked ) {
	
	/* Debug */
	
	console.log('InDB.store.create', name, key, autoinc_key, unique, on_success, on_error, on_abort );

	if( !!InDB.debug ) {
		console.log ( "InDB.store.create", name, key, autoinc_key, on_success, on_error, on_abort );
	}

	/* Assertions */	

	if ( !InDB.assert( !InDB.isEmpty( name ), "object store name should not be empty" ) ) { 
		return false;
	}

	if ( !InDB.assert( !InDB.store.exists( name ) , "object store should not already exist" ) ) { 
		return false;
	}

	// TODO: #Question: Is this true?
	if ( !InDB.assert( !InDB.isEmpty( key ), "object store needs a key" ) ) { 
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
		on_success = InDB.events.onSuccess;
	}
	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	if ( "undefined" === typeof on_blocked ) {
		on_blocked = InDB.events.onBlocked;
	}
	
	var context =  { "name": name, "keyPath": keyPath, "autoinc_key": autoinc_key };

	/* Debug */
	
	if( !!InDB.debug ) {
		console.log( 'InDB.store.create context', context );
	}

	// Database changes must happen w/in a setVersion transaction
	var version = parseInt( InDB.db.version, 10 );
	version = ( isNaN( version ) ) ? 1 : version + 1;
	
	var setVersionRequest = InDB.db.setVersion( version );
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
			InDB.db.createObjectStore( name, options );

			context[ 'event' ] = event;

			on_success( context );

			InDB.trigger( "InDB_store_created_success", context );

		} catch( error ) {

			// createdObject store threw an error 
			context[ 'error' ] = error;
			on_error( context );
			InDB.trigger( "InDB_store_created_error", context );
			//if already created, then the store already exists
			if ( IDBDatabaseException.CONSTRAINT_ERR === error.code ) {
				InDB.trigger( "InDB_store_already_exists", context );
			}
		}
	};

	setVersionRequest.onblocked = function ( event ) {
		context[ 'event' ] = event;
		on_blocked( context );
		InDB.trigger( "InDB_store_created_error", context );
	};

	setVersionRequest.onerror = function ( event ) {
		context[ 'event' ] = event;
		on_error( context );
		InDB.trigger( "InDB_store_created_error", context );
	};

	setVersionRequest.onabort = function ( event ) {
		context[ 'event' ] = event;
		on_abort( context );
		InDB.trigger( "InDB_store_created_abort", context );
	};

}


InDB.bind( 'InDB_do_indexes_create', function ( event, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_create_indexes', event, context );
	}

	/* Setup */

	var indexes = context.indexes;
	var on_success = context.on_success;
	var on_error = context.on_error;
	var on_abort = context.on_abort;

	/* Assertions */

	// Assert that the database is already loaded
	if ( !InDB.assert( InDB.db !== 'Object', 'Database not loaded' ) ) {
		return;
	}

	/* Request */
	
	InDB.indexes.create( indexes, on_success, on_error, on_abort );

} );

InDB.indexes.create = function ( stores, on_success, on_error, on_abort ) {
	var context = { 'indexes': stores, 'on_success': on_success, 'on_error': on_error, 'on_abort': on_abort }; 
	if( !!InDB.debug ) {
		console.log( 'InDB.indexes.create', context );
	}
	//TODO: Assertions
	for( store in stores ) {
		//TODO: Cache vars to prevent wasted nested lookups
		for( index in stores[store] ) {
			if( stores[store].hasOwnProperty( index ) ) {

				var options = stores[store][index];
				var key, unique, empty_key, multirow;
				var name = index;

				if ( !InDB.index.exists( store, index ) ) {
					//TODO: Cleanup
					if( "undefined" !== typeof options && !InDB.isEmpty( options.key ) ) {
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

			if ( "undefined" === typeof unique || !InDB.isBoolean( unique ) ) { 

				unique = false; 
			}

			/* Assertions */
			
			InDB.assert( !InDB.isEmpty( key ), 'Must provide an index key' );  
			InDB.assert( ( InDB.isBoolean( unique ) ), 'Unique key value must be a boolean' );

			/* Debug */

			if( !!InDB.debug ) {
				console.log( 'InDB.indexes.create calling InDB.index.create', store, key, name, unique, multirow, on_success, on_error, on_abort );
			}

			/* Request */
			
			InDB.index.create( store, key, name, unique, multirow, on_success, on_error, on_abort );
			
		}
	}
};


//context.store, context.key, context.index, context.on_success, context.on_error, context.on_abort, context.unique, context.multirow
InDB.bind( 'InDB_do_index_create', function( row_result, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_index_create', row_result, context );
	}

	/* Assertions */
	if ( !InDB.assert( !InDB.isEmpty( context.store ), 'Must provide a store for index' ) ) {
		return;
	}
			
	if ( !InDB.assert( !InDB.isEmpty( context.key ), 'Must provide a key for index' ) ) {
		return;
	}
	
	if ( !InDB.assert( !InDB.isEmpty( context.name ), 'Must provide a name for index' ) ) {
		return;
	}


	/* Invocation */

	InDB.index.create( context.store, context.key, context.name, context.unique, context.multirow, context.on_success, context.on_error, context.on_abort );
} );


/* unique defaults to false if not present */
InDB.index.create = function ( store, key, name, unique, multirow, on_success, on_error, on_abort ) {
	
	/* Debug */

	if( !!InDB.debug ) {
		console.log( 'InDB.index.create', store, key, name, unique, multirow, on_success, on_error, on_abort );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide a store for index' ) ) {
		return;
	}
			
	if ( !InDB.assert( !InDB.isEmpty( key ), 'Must provide a key for index' ) ) {
		return;
	}
	
	if ( !InDB.assert( !InDB.isEmpty( name ), 'Must provide a name for index' ) ) {
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
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	/* Context */

	var context = { "store": store, "key": key, "name": name, "unique": unique, "multirow": multirow, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

	/* Request */

	// Database changes need to happen from w/in a setVersionRequest
	var version = ( parseInt( InDB.db.version, 10 ) ) ? parseInt( InDB.db.version, 10 ) : 0;
        var setVersionRequest = InDB.db.setVersion( version );
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
InDB.bind( 'InDB_do_index_delete', function( row_result, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_index_delete', row_result, context );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( context.store ), 'Must provide a store for index' ) ) {
		return;
	}
			
	if ( !InDB.assert( !InDB.isEmpty( context.name ), 'Must provide a name for index' ) ) {
		return;
	}

	/* Invocation */

	InDB.index.delete( context.store, context.name, context.on_success, context.on_error, context.on_abort );

} );


/* unique defaults to false if not present */
InDB.index.delete = function ( store, name, on_success, on_success, on_abort ) {
	
	/* Debug */

	if( !!InDB.debug ) {
		console.log( 'InDB.index.delete', store, name, on_success, on_error, on_abort );
	}

	/* Assertions */	

	if ( !InDB.assert( !InDB.isEmpty( store ), "object store name cannot be empty" ) ) { 
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( name ), "index name cannot be empty" ) ) { 
		return;
	}

	/* Defaults */	

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	/* Context */

	var context = { "store": store, "name": name, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

	/* Request */

	// Database changes need to happen from w/in a setVersionRequest
	var version = ( parseInt( InDB.db.version, 10 ) ) ? parseInt( InDB.db.version, 10 ) : 0;
        var setVersionRequest = InDB.db.setVersion( version );

	/* Request Responses */

	setVersionRequest.onsuccess = function ( event ) {
	
		var result = event.target.result;
		var databaseTransaction = result.objectStore( store );
		console.log( databaseTransaction );
		databaseTransaction.deleteIndex( name );

		databaseTransaction.onsuccess = function ( event ) {
			context[ 'event' ] = event;
			on_success( context );
			InDB.trigger( 'index_created_success', context );
		};

		databaseTransaction.onerror = function ( event ) {
			context[ 'event' ] = event;
			on_error( context );
			InDB.trigger( 'index_created_error', context );
		};

		databaseTransaction.onabort = function ( event ) {
			context[ 'event' ] = event;
			on_abort( context );
			InDB.trigger( 'index_created_abort', context );
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

InDB.database.open = function ( name, description, on_success, on_error, on_abort ) {

	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	/* Context */

	var context = { "name": name, "description": description, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

	/* Action */

	InDB.trigger( 'InDB_open_database', context );

	/* Request */

	var open_database_request = window.indexedDB.open( name, description );

	/* Request Responses */

	database_open_request.onsuccess = function ( event ) {

		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_success( context );

		/* Action */

		InDB.trigger( 'InDB_open_database_success', context );

	};

	database_open_request.onerror = function ( event ) {
		
		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_error( context );

		/* Action */

		InDB.trigger( 'InDB_open_database_error', context );

	}

	database_open_request.onabort = function ( event ) {

		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_abort( context );

		/* Action */

		InDB.trigger( 'InDB_open_database_abort', context );

	}

}

/**
 * Transactions
 *
 **/

/* Transaction types */
InDB.transaction.read = function () {
	return IDBTransaction.READ_ONLY;
} 
InDB.transaction.read_write = function () {
	return IDBTransaction.READ_WRITE;
} 
InDB.transaction.write = function () {
	return IDBTransaction.READ_WRITE;
} 

/* Transaction factory */
InDB.transaction.create = function ( database, type, on_complete, on_error, on_abort ) {
	InDB.trigger( 'InDB_create_transaction', { "name": name, "type": type, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );		
	if ( "undefined" === typeof type ) {
		type = IDBTransaction.READ_WRITE;
	}
	if ( "undefined" === typeof timeout ) {
		timeout = 1000;
	}
	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}
	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	try {
		if ( !!InDB.debug ) {
			console.log ( "InDB.db.transaction.create", database, type, timeout );
		}
		var transaction = InDB.db.transaction( [ database ], type, timeout );
		transaction.oncomplete = function ( event ) {
			on_complete( event );
			InDB.trigger( 'transaction_complete', { "database": database, "type": type, "timeout": timeout } );
		};
		transaction.onerror = function ( event ) {
			on_error( event );
			InDB.trigger( 'transaction_error', { "database": database, "type": type, "timeout": timeout } );
		};
		transaction.onabort = function ( event ) {
			on_abort( event );
			InDB.trigger( 'transaction_abort', { "database": database, "type": type, "timeout": timeout } );
		};
		return transaction.objectStore( database );
	} catch ( event ) {
		return event;
	};
}


InDB.row.result = function ( event ) {
	if( 'undefined' !== typeof event && 'undefined' !== typeof event.event ) {
		event = event.event;
	}
	if ( 'undefined' !== typeof event && "undefined" !== typeof event.result ) {
		return event.result;
	} else {
		return null;
	}
}


InDB.row.value = function ( event ) {

	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.value', event );
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


InDB.cursor.result = function ( event ) {
	if ( !!InDB.debug ) {
		console.log ( 'InDB.cursor.result', event );
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


InDB.cursor.value = function ( event ) {
	if ( !!InDB.debug ) {
		console.log ( 'InDB.cursor.value', event );
	}
	if( 'undefined' !== typeof event.event ) {
		event = event.event;
	}
	if ( "undefined" !== typeof event.target && "undefined" !== typeof event.target.result && null !== event.target.result ) {
		return event.target.result.value;
	} else {
		return null;
	}
}


InDB.database.errorType = function ( code ) {

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
InDB.range.only = function ( value ) {
	return InDB.range.get( value, null, null, null, null );
}
InDB.range.left = function ( left_bound ) {
	return InDB.range.get( null, left_bound, null, false, null );
}
InDB.range.left_open = function ( left_bound ) {
	return InDB.range.get( null, left_bound, null, true, null );
}
InDB.range.right = function ( right_bound ) {
	return InDB.range.get( null, null, right_bound, null, false );
}
InDB.range.right_open = function ( right_bound ) {
	return InDB.range.get( null, null, right_bound, null, true );
}

/* returns an IDBKeyRange given a range type
 * returns false if type is not valid;
 * valid types: bound, leftBound, only, rightBound */
/* uses duck typing to determine key type */
/* more info: https://developer.mozilla.org/en/indexeddb/idbkeyrange*/
InDB.range.get = function ( value, left_bound, right_bound, includes_left_bound, includes_right_bound ) {
	if ( !!InDB.debug ) {
		console.log ( 'InDB.range.get', value, left_bound, right_bound, includes_left_bound, includes_right_bound );
	}
	if ( InDB.exists( left_bound ) && InDB.exists( right_bound ) && InDB.exists( includes_left_bound ) && InDB.exists( includes_right_bound ) ) {	
		return IDBKeyRange.bound( left_bound, right_bound, includes_left_bound, includes_right_bound );	
	} else if ( InDB.exists( left_bound ) && InDB.exists( includes_left_bound ) ) {
		return IDBKeyRange.lowerBound( left_bound, includes_left_bound );
	} else if ( InDB.exists( right_bound ) && InDB.exists( includes_right_bound ) ) {
		return IDBKeyRange.upperBound( right_bound, includes_right_bound );
	} else if ( InDB.exists( value ) ) {
		return IDBKeyRange.only( value );
	}  else {
		return false;
	}
}


//context.store, context.key, context.index, context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_row_get', function( row_result, context ) {
	
	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_row_get', row_result, context );
	}

	/* Setup */

	var store = context.store;

	var key = context.key;

	var index = context.index;

	/* Defaults */

	index = ( 'undefined' !== index ) ? index : null;

	/* Assertions */
	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}
		
	if ( !InDB.assert( !InDB.isEmpty( key ), 'Must provide a key to get' ) ) {
		return;
	}

	/* Invocation */

	InDB.row.get( store, key, index, context.on_success, context.on_error, context.on_abort, context.on_complete );
} );


InDB.row.get = function ( store, key, index, on_success, on_error, on_abort, on_complete ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.get', store, key, index, on_success, on_error, on_abort, on_complete );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}
		
	if ( !InDB.assert( !InDB.isEmpty( key ), 'Must provide a key to get' ) ) {
		return;
	}

	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}

	index = ( !InDB.isEmpty( index ) ) ? index : null;

	/* Context */

	var context =  { "store": store, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

	/* Action */

	InDB.trigger( 'InDB_row_get', context );

	/* Transaction */
	
	var transaction = InDB.transaction.create( store, InDB.transaction.read() );

	/* Transaction Callback */
	
	transaction.oncomplete = on_complete;

	/* Debug */
	
	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.get transaction', transaction );
	}

	/* Request */

	var request = {};

	/* Optional Index */

	if ( "undefined" !== typeof index && null !== index ) {
		var transaction_index = transaction.index( index );
		if( !!InDB.debug ) {
			console.log( 'InDB.row.get (using index)', transaction, transaction_index, index, key );
		}
		request = transaction_index.get( key );
	} else {
		request = transaction.get( key );
	}
	
	/* Request Responses */
	
	request.onsuccess = function ( event ) {	

		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_success( context );
	
		/* Action */
		
		InDB.trigger( 'InDB_row_get_success', context );

	}

	request.onerror = function ( event ) {
	
		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_error( context );

		/* Action */

		InDB.trigger( 'InDB_row_get_error', context );

	}
	
	request.onabort = function ( event ) {
	
		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_abort( context );
	
		/* Action */
	
		InDB.trigger( 'InDB_row_get_abort', context );

	}
}


//context.store, context.key, context.index, context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_row_delete', function( row_result, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_row_delete', row_result, context );
	}

        /* Assertions */

        if ( !InDB.assert( !InDB.isEmpty( context.store ), 'Must provide an object store' ) ) {
                return;
        }

        if ( !InDB.assert( !InDB.isEmpty( context.key ), 'Must provide a key to delete' ) ) {
                return;
        }	

	/* Invocation */

	InDB.row.delete( context.store, context.key, context.on_success, context.on_error, context.on_abort, context.on_complete );

} );


InDB.row.delete = function ( store, key, on_success, on_error, on_abort, on_complete ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.delete', store, key, on_success, on_error, on_abort );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( key ), 'Must provide a key to delete' ) ) {
		return;
	}

	/* Context */

	var context = { "store": store, "key": key, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

	/* Action */

	InDB.trigger( 'InDB_row_delete', context );

	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}
	
	/* Transaction */

	var transaction = InDB.transaction.create( store, InDB.transaction.write() );

	/* Transaction Callback */
	
	transaction.oncomplete = on_complete;
	
	/* Debug */
	
	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.delete transaction', transaction );
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

		InDB.trigger( 'set_success', context );

	}

	request.onerror = function ( event ) {	

		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_error( context );
	
		/* Action */

		InDB.trigger( 'set_error', context );

	}

	request.onabort = function ( event ) {	
	
		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_abort( event );
	
		/* Action */

		InDB.trigger( 'set_abort', context );

	}

}

//context.store, context.data, context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_row_add', function( row_result, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_row_add', row_result, context );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( context.store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( context.data ), 'Must provide an object to store' ) ) {
		return;
	}

	/* Invocation */

	InDB.row.add( context.store, context.data, context.on_success, context.on_error, context.on_abort, context.on_complete );
} );


/* Adds a data object to an object store */
InDB.row.add = function ( store, data, on_success, on_error, on_abort, on_complete ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.add', store, data, on_success, on_error, on_abort );
	}


        /* Assertions */

        if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
                return;
        }

        if ( !InDB.assert( !InDB.isEmpty( data ), 'Must provide an object to store' ) ) {
                return;
        }


	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_abort ) {
		on_complete = InDB.events.onComplete;
	}


	/* Context */

	var context = { "store": store, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };


	/* Action */

	InDB.trigger( 'InDB_row_add', context );

	if ( !!InDB.debug ) {
		console.log( 'InDB_row_add', context );
	}


	/* Transaction */

	var transaction = InDB.transaction.create( store, InDB.transaction.read_write() );


	/* Transaction Callback */
	
	transaction.oncomplete = on_complete;	


	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.add transaction', data, transaction );
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

			InDB.trigger( 'InDB_row_add_success', context );

		}

		request.onerror = function ( event ) {
	
			/* Context */

			context[ 'event' ] = event;
	

			/* Callback */

			on_error( context );

	
			/* Action */

			InDB.trigger( 'InDB_row_add_error', context );

		}

		request.onabort = function ( event ) {

			/* Context */

			context[ 'event' ] = event;
	

			/* Callback */

			on_abort( context );


			/* Action */

			InDB.trigger( 'InDB_row_add_abort', context );

		}

	} catch( event ) {

		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( event );
			console.log ( 'errorType', InDB.database.errorType( event.code ) );
		}	
		

		/* Context */

		context[ 'event' ] = event;
			

		/* Action */

		InDB.trigger( 'InDB_row_add_error', context );

	}
}


//context.store, context.key, context.index, context.data, context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_row_update', function( row_result, context ) {
	
	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_row_update', row_result, JSON.stringify( context ) );
	}


	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( context.store ), 'Must provide an object store' ) ) {
		return;
	}
		
	if ( !InDB.assert( !InDB.isEmpty( context.key ), 'Must provide a range to get' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( context.data ), 'Must provide data to update' ) ) {
		return;
	}

	/* Invocation */

	InDB.row.update( context.store, context.key, context.index, context.data, context.replace, context.expecting, context.on_success, context.on_error, context.on_abort, context.on_complete );


} );


InDB.row.update = function ( store, key, index, data, replace, expecting, on_success, on_error, on_abort, on_complete ) {


	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.update', store, key, index, on_success, on_error, on_abort, on_complete );
	}


	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}
		
	if ( !InDB.assert( !InDB.isEmpty( key ), 'Must provide a range to get' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( data ), 'Must provide data to update' ) ) {
		return;
	}


	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}

	index = ( !InDB.isEmpty( index ) ) ? index : null;
	
	expecting = ( !InDB.isEmpty( expecting ) ) ? expecting : null;
	
	replace = ( InDB.isBoolean( replace ) ) ? replace : false;

	/* Context */

	var context =  { "store": store, "key": key, "index": index, "data": data, "replace": replace, "expecting": expecting, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

	/* Action */

	InDB.trigger( 'InDB_row_update', context );

	var callback = function( callback_context ) {

		var result = InDB.row.value( callback_context.event );
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

						if( !!InDB.debug ) {
							console.log( 'InDB.row.update > value was not expected.', result[ attr ], expecting[ attr ] );
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

		if( !!InDB.debug ) {
			console.log( 'InDB.row.update context', context );
			console.log( 'InDB.row.update before/after', result, data );
		}

		InDB.row.put( store, data, null, on_success, on_error, on_abort, on_complete );

	};

	InDB.row.get( context.store, context.key, context.index, callback, context.on_error, context.on_abort );

}



//context.store, context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_store_clear', function( row_result, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_store_clear', row_result, context );
	}


        /* Assertions */
        
        if ( !InDB.assert( !InDB.isEmpty( context.store ), 'Must provide an object store' ) ) {
                return; 
        }       


	/* Invocation */

	InDB.store.clear( context.store, context.on_success, context.on_error, context.on_abort );

} );


/* Clears an object store of any objects */
InDB.store.clear = function ( store, on_success, on_error, on_abort ) {

	/* Debug */
	
	console.log ( 'InDB.store.clear', store, on_success, on_error, on_abort );	


        /* Assertions */
        
        if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
                return; 
        }       


	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}


	/* Context */

	var context = { "store": store, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };

	
	/* Action */

	InDB.trigger( 'InDB_store_clear', context );


	/* Transaction */

	var transaction = InDB.transaction.create( store, InDB.transaction.read_write() );


	/* Transaction Callback */

	transaction.oncomplete = on_complete;


	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.store.clear transaction', transaction );
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

		InDB.trigger( 'InDB_store_clear_success', context );

	}

	request.onerror = function ( event ) {
		
		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_error( event );

		/* Action */

		InDB.trigger( 'InDB_row_put_error', context );

	}

	request.onabort = function ( event ) {
		
		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_abort( event );
		
		/* Action */

		InDB.trigger( 'InDB_row_put_abort', context );

	}
}


//context.store, context.data, context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_row_put', function( row_result, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_row_put', row_result, context );
	}

        /* Assertions */
        
        if ( !InDB.assert( !InDB.isEmpty( context.store ), 'Must provide an object store' ) ) {
                return; 
        }       

        if ( !InDB.assert( !InDB.isEmpty( context.data ), 'Must provide an object to store' ) ) {
                return; 
        }       

	/* Invocation */

	InDB.row.put( context.store, context.data, context.key, context.on_success, context.on_error, context.on_abort, context.on_complete );

} );


/* Puts a data object to an object store */
InDB.row.put = function ( store, data, key, on_success, on_error, on_abort, on_complete ) {

	/* Debug */
	
	if ( !!InDB.debug ) {
		console.log ( 'InDB.row.put', store, data, key, on_success, on_error, on_abort, on_complete );	
	}

        /* Assertions */
        
        if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
                return; 
        }       

        if ( !InDB.assert( !InDB.isEmpty( data ), 'Must provide an object to store' ) ) {
                return; 
        }       

	/* Defaults */

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}

	key = ( !!key ) ? key : null;


	/* Context */

	var context = { "store": store, "key": key, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

	
	/* Action */

	InDB.trigger( 'InDB_row_put', context );


	/* Transaction */

	var transaction = InDB.transaction.create( store, InDB.transaction.read_write() );


	/* Transaction Callback */
	
	transaction.oncomplete = on_complete;

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_row_put transaction', transaction );
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

			InDB.trigger( 'InDB_row_put_success', context );

		}

		request.onerror = function ( event ) {

			/* Context */

			context[ 'event' ] = event;
	
			/* Callback */

			on_error( event );

			/* Action */

			InDB.trigger( 'InDB_row_put_error', context );

		}

		request.onabort = function ( event ) {

			/* Context */

			context[ 'event' ] = event;
	
			/* Callback */

			on_abort( event );
			
			/* Action */

			InDB.trigger( 'InDB_row_put_abort', context );

		}

	} catch( error ) {

		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( 'errorType', InDB.database.errorType( error.code ) );
		}

		/* Context */

		context[ 'error' ] = error;

		on_error( context );
	
	}
}


/* TODO: On complete */
InDB.bind( 'InDB_do_cursor_get', function( row_result, context ) {
	
	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_cursor_get', row_result, context );
	}

	/* Setup */

	var store = context.store; // Required
	var index = context.index; // Optional
	var keyRange = context.keyRange; // Required

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( keyRange ), 'Must provide keyRange' ) ) {
		return;
	}

	/* Defaults */

	index = ( !InDB.isEmpty( context.index ) ) ? context.index : null;

	/* Invocation */
	
	InDB.cursor.get( store, index, keyRange, context.on_success, context.on_error, context.on_abort, context.on_complete );

} );

/* TODO: Direction? */
InDB.cursor.get = function ( store, index, keyRange, on_success, on_error, on_abort, on_complete ) {

	/* Debug */
	if ( !!InDB.debug ) {	
		console.log ( 'InDB.cursor.get', store, index, keyRange, on_success, on_error, on_abort, on_complete );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( 'undefined' !== typeof keyRange, 'keyRange must be an IDBKeyRange' ) ) {
		return;
	}

	/* Defaults */

	index = ( !InDB.isEmpty( index ) ) ? index : null;

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}

	/* Context */

	var context =  { "store": store, "index": index, "keyRange": keyRange, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

	/* Debug */
	
	if( !!InDB.debug ) {
		console.log( 'indb.js > InDB.cursor.get() > Doing InDB_cursor_get', context );
	}	
	
	/* Action */

	InDB.trigger( 'InDB_cursor_get', context );
	
	try {

		/* Transaction */

		var transaction = InDB.transaction.create ( store, InDB.transaction.read_write() );

		/* Callbacks */
	
		transaction.oncomplete = on_complete;

		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( 'InDB.cursor.get transaction', transaction, index, typeof index );
		}

		/* Request */

		var request;
		
		/* Optional Index */

		if ( !InDB.isEmpty( index ) ) {

			/* Debug */

			if ( !!InDB.debug ) {
				console.log ( 'transaction_index.openCursor (index)', transaction, index, keyRange );
			}

			// Using index
			var transaction_index = transaction.index( index );

			/* Request */

			request = transaction_index.openCursor( keyRange );

		} else {

			/* Debug */

			if ( !!InDB.debug ) {
				console.log ( 'transaction.openCursor (no index)', transaction, keyRange );
			}

			// No index

			/* Request */

			request = transaction.openCursor( keyRange );

		}

		/* Request Responses */

		request.onsuccess = function ( event ) {	

			/* Debug */

			if ( !!InDB.debug ) {
				console.log ( 'cursor.get result', InDB.cursor.result( event ) );
				console.log ( 'cursor.value value', InDB.cursor.value( event ) );
			}

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_success( context ); 

			/* Action */

			InDB.trigger( 'InDB_cursor_row_get_success', context );

			/* Result */
			
			var result = event.target.result;

			if ( !InDB.isEmpty( result ) && "undefined" !== typeof result.value ) {
				// Move cursor to next key
				result[ 'continue' ]();
			}
		}

		request.onerror = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_error( context );

			/* Debug */

			if ( !!InDB.debug ) {
				console.log ( 'Doing InDB_cursor_row_get_error', context );
			}

			/* Action */

			InDB.trigger( 'InDB_cursor_row_get_error', context );

		}

		request.onabort = function ( event ) {	

			/* Context */

			context[ 'event' ] = event;

			/* Callback */

			on_abort( event );
			
			/* Debug */

			if ( !!InDB.debug ) {
				console.log ( 'Doing InDB_cursor_row_get_abort', context );
			}

			/* Action */

			InDB.trigger( 'InDB_cursor_row_get_abort', context );

		}

	} catch ( error ) {

		context[ 'error' ] = error;
		on_error( context );

		if( !!InDB.debug ) {
			console.log('Error in cursor get row', error );
		}

	}
}

//context.store, context.index, context.keyRange (e.g. InDB.range.left_open( "0" ) ), context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_cursor_update', function( row_result, context ) {
	
	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_cursor_update', row_result, context );
	}

	/* Setup */

	var store = context.store; // Required
	var index = context.index; // Optional; Defaults to null
	var keyRange = context.keyRange; // Required
	var data = context.data; // Required
	var replace = context.replace; // Optional; Defaults to false
	var expecting = context.expecting; // Optional; Defaults to null

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( data ), 'Must provide an object' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( keyRange ), 'Must provide keyRange' ) ) {
		return;
	}

	/* Defaults */

	replace = ( InDB.isBoolean( replace ) ) ? replace : false;

	index = ( !InDB.isEmpty( index ) ) ? index : null;

	expecting = ( !InDB.isEmpty( expecting ) ) ? expecting : null;

	/* Invocation */

	InDB.cursor.update( store, index, keyRange, data, replace, expecting, context.on_success, context.on_error, context.on_abort, context.on_complete );

} );


InDB.cursor.update = function ( store, index, keyRange, data, replace, expecting, on_success, on_error, on_abort, on_complete ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.cursor.update', store, index, keyRange, data, on_success, on_error, on_abort, on_complete );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( data ), 'Must provide an object' ) ) {
		return;
	}

	if ( !InDB.assert( 'undefined' !== typeof keyRange, 'keyRange must be an IDBKeyRange' ) ) {
		return;
	}

	/* Defaults */

	replace = ( InDB.isBoolean( replace ) ) ? replace : false;

	index = ( !InDB.isEmpty( index ) ) ? index : null;
	
	expecting = ( !InDB.isEmpty( expecting ) ) ? expecting : null;

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_complete ) {
		on_abort = InDB.events.onComplete;
	}


	/* Context */

	var context = { "store": store, "keyRange": keyRange, "index": index, "data": data, "replace": replace, "expecting": expecting, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

	/* Action */

	InDB.trigger( 'InDB_cursor_update', context );
	
	/* Transaction */

	var transaction = InDB.transaction.create( store, InDB.transaction.read_write() );

	transaction.oncomplete = on_complete;

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.cursor.update transaction', transaction, index, typeof index );
	}

	/* Request */

	var request;

	/* Optional Index */

	if ( "undefined" !== typeof index && !InDB.isEmpty( index ) ) {

		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( 'transaction_index.openCursor', index, keyRange );
		}
		
		// Using index
		var transaction_index = transaction.index( index );
	
		/* Request */

		request = transaction_index.openCursor( keyRange );

	} else {

		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( 'transaction.openCursor', keyRange );

		}

		// No index

		/* Request */

		request = transaction.openCursor( keyRange );

	}

	/* Request Responses */

	request.onsuccess = function ( event ) {	

		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_success( context );

		/* Action */

		InDB.trigger( 'InDB_cursor_row_update_success', context );

		/* Update */

		var result = InDB.row.value( context.event );

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
				if( 'undefined' !== typeof expecting && null !== expecting && 'undefined' !== result[ attr ] && 'undefined' !== typeof expecting[ attr ] && null !== expecting[ attr ] ) {

					if( result[ attr ] !== expecting[ attr ] ) {

						if( !!InDB.debug ) {
							console.log( 'InDB.row.update > value was not expected.', result[ attr ], expecting[ attr ] );
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
			data = temp_data;
		}


		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( 'InDB.cursor.update context.data update_data', update_data );
		}


		if ( "undefined" !== typeof result && "undefined" !== typeof result.value ) {
			// Update current cursor item
			result[ 'update' ]( data );
			// Move cursor to next key
			result[ 'continue' ]();
		}
	}

	request.onerror = function ( event ) {	

		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_error( context );

		/* Action */

		InDB.trigger( 'InDB_cursor_row_update_error', context );

	}

	request.onabort = function ( event ) {	

		/* Context */

		context[ 'event' ] = event;

		/* Callback */

		on_abort( context );

		/* Action */

		InDB.trigger( 'InDB_cursor_row_update_abort', context );

	}

}


//context.database, context.index, context.keyRange (e.g. InDB.range.left_open( "0" ) ), context.on_success, context.on_error, context.on_abort
InDB.bind( 'InDB_do_cursor_delete', function( row_result, context ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB_do_cursor_delete', row_result, context );
	}

	/* Setup */

	var store = context.store; // Required
	var keyRange = context.keyRange; // Required
	var index = context.index; // Required

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( !InDB.isEmpty( keyRange ), 'Must provide keyRange' ) ) {
		return;
	}

	/* Defaults */

	index = ( !InDB.isEmpty( index ) ) ? index : null;

	/* Invocation */

	InDB.cursor.delete( store, index, keyRange, context.on_success, context.on_error, context.on_abort, context.on_complete );

} );

InDB.cursor.delete = function ( store, index, keyRange, on_success, on_error, on_abort, on_complete ) {

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.cursor.get', store, index, keyRange, on_success, on_error, on_abort, on_complete );
	}

	/* Assertions */

	if ( !InDB.assert( !InDB.isEmpty( store ), 'Must provide an object store' ) ) {
		return;
	}

	if ( !InDB.assert( 'undefined' !== typeof keyRange, 'keyRange must be an IDBKeyRange' ) ) {
		return;
	}

	/* Defaults */

	index = ( !InDB.isEmpty( index ) ) ? index : null;

	if ( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}

	if ( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}

	if ( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if ( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}


	/* Context */

	var context = { "store": store, "keyRange": keyRange, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort, "on_complete": on_complete };

	/* Action */
	
	InDB.trigger( 'InDB_cursor_delete', context );

	/* Transaction */

	var transaction = InDB.transaction.create( store, InDB.transaction.read_write() );

	transaction.oncomplete = on_complete;

	/* Debug */

	if ( !!InDB.debug ) {
		console.log ( 'InDB.cursor.get transaction', transaction, index, typeof index );
	}

	/* Request */

	var request;
	
	/* Optional Index */

	if ( "undefined" !== typeof index && !InDB.isEmpty( index ) ) {

		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( 'InDB.cursor.get transaction_index.openCursor', index, keyRange );
		}

		// Using index
		var transaction_index = transaction.index( index );

		/* Request */
		request = transaction_index.openCursor( keyRange );

	} else {

		/* Debug */

		if ( !!InDB.debug ) {
			console.log ( 'InDB.cursor.get transaction.openCursor', keyRange );
		}
		
		// No index

		/* Request */
		request = transaction.openCursor( keyRange );

	}

	/* Request Responses */

	request.onsuccess = function ( event ) {	

		/* Context */
		
		context[ 'event' ] = event;

		/* Callback */

		on_success( context );

		/* Action */

		InDB.trigger( 'InDB_cursor_row_delete_success', context );

		/* Result */

		var result = event.target.result;

		if ( "undefined" !== typeof result && "undefined" !== typeof result.value ) {
			// Delete current cursor item
			result[ 'delete' ]();
			// Move cursor to next item
			result[ 'continue' ]();
		}
	}
	request.onerror = function ( event ) {	
	
		/* Context */
		
		context[ 'event' ] = event;
	
		/* Callback */

		on_error( context );
		
		/* Action */

		InDB.trigger( 'InDB_cursor_row_delete_error', context );

	}

	request.onabort = function ( event ) {	
	
		/* Context */
		
		context[ 'event' ] = event;
	
		/* Callback */

		on_abort( context );
		
		/* Action */

		InDB.trigger( 'InDB_cursor_row_delete_abort', context );

	}

}

/* Utilities */

InDB.utilities.random = function( length, type ) {
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
