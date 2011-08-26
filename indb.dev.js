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
InDB.range = {};
InDB.row = {};
InDB.cursor = {};
InDB.event = {};
InDB.events = {};
InDB.transaction = {};
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
	if( !!InDB.debug ) {
		console.log( "IndexedDB request completed", e );
	}
};
InDB.events.onSuccess = function ( e ) {
	if( !!InDB.debug ) {
		console.log( "IndexedDB request successful", e );
	}
};
InDB.events.onError = function ( e ) {
	if( !!InDB.debug ) {
		console.log( "IndexedDB request errored", e );
	}
};
InDB.events.onAbort = function ( e ) {
	if( !!InDB.debug ) {
		console.log( "IndexedDB request aborted", e );
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
 *  InDB_stores_loaded_{success|error|abort} - Database is loaded and all collections have been created
 *  InDB_store_created_{success|error|abort} - Response to an attempt at creating an object store
 *  InDB_database_already_loaded - a specific type of InDB_database_loaded_error
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
/* Bug (sort of): The InDB.db namespace means that it works with only one 
 * IndexedDB database at a time. */
/* This function is indempodent (you can run it multiple times and it won't do anything */
InDB.database.load = function ( name, description, on_success, on_error, on_abort ) {

	/* Begin Debug */
	if( !!InDB.debug ) {
		console.log( "InDB.database.load", name, description, on_success, on_error, on_abort );
	}
	/* End Debug */

	if( "IDBDatabase" === typeof InDB.db && name === InDB.db.name ) {
		on_error( new Error( "Database already loaded" ) );
		InDB.trigger( 'InDB_database_already_loaded', context );
		return;
	}
	var context = { "name": name, "description": description, "on_success": on_success, "on_error": on_error, "on_abort": on_abort };
	InDB.trigger( 'InDB_database_loading', context );

	/* Assertions */	
	if( !InDB.assert( !InDB.isEmpty( name ), "database name cannot be empty" ) ) { 
		return;
	}
	if( !InDB.assert( !InDB.isEmpty( description ), "database description cannot be empty" ) ) { 
		return;
	}

	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	if( "undefined" !== typeof InDB.db && name === InDB.db.name ) {
		InDB.trigger( 'InDB_database_loaded_success', context );
		InDB.trigger( 'InDB_stores_loaded_success', context );
	} else {
		var open_request = window.indexedDB.open( name, description );
		open_request.onsuccess = function ( event ) {
			InDB.db = event.target.result;
			on_success( event );
			if( isNaN( InDB.db.version ) ) {
				InDB.trigger( 'InDB_database_loaded_success', context );
				InDB.trigger( 'InDB_database_created_success', context );
				/* Database is unversioned, so create object stores */
				InDB.trigger( 'InDB_stores_loaded_success', context );
			} else {
				InDB.trigger( 'InDB_database_loaded_success', context );
				InDB.trigger( 'InDB_stores_loaded_success', context );
			}
		}
		open_request.onerror = function ( event ) {
			on_error( event );
			InDB.trigger( 'InDB_database_loaded_error' );
		}
		open_request.onabort = function ( event ) {
			on_abort( event );
			InDB.trigger( 'InDB_database_loaded_error' )
		}
	}
}

InDB.checkBrowser = function () {
	InDB.trigger( 'InDB_checking_browser' );		
	var result = -1;
	// the support check
	if( !!window.webkitIndexedDB || !!window.mozIndexedDB ) {
		result = 0;
	} else if(!!window.indexedDB ) {
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

	error_message = ( !!error_message ) ? error_message : "False assertion";
	result = false;
	switch( warn_level ) {
		case 'log':
			( statement ) ? result = true : console.log( error_message );
			break;
		case 'alert': 
			( statement ) ? result = true : alert( error_message );
			break;
		default: 
			if( statement ) { 
				result = true;
			} else {
				throw new Error( error_message );
			}
			break;
	}
	return result;
}


/* InDB.isEmpty ( mixed var ) -> bool
 * Checks whether a variable has a value */
InDB.isEmpty = function ( mixed_var ) {
	return ( "undefined" !== typeof mixed_var && null !== mixed_var && "" !== mixed_var ) ? false : true;
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
	return InDB.isType( "boolean", mixed_var );
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

/* Begin Object Store Methods */

InDB.store.exists = function ( name ) {
	for( i=0; i<InDB.db.objectStoreNames.length; i++ ) {
		if ( name === InDB.db.objectStoreNames[i] ) {
			return true;
		}
	}
	return false;
}

InDB.stores.create = function ( stores, on_success, on_error, on_abort ) {
	//TODO: Assertions
	for( store in stores ) {
		var options = stores[ store ];
		if( InDB.isString( options ) ) {
			/* options object is really a string
                         * recast options var from a string to a
                         * real deal options object */
			options = InDB.store.options( options );
		}
		if( !InDB.isEmpty( options ) && !InDB.store.exists( store ) ) {
			var key = options.key;
			var autoinc_key = options.incrementing_key;
			var empty_key = InDB.isEmpty( key );
			InDB.assert( ( empty_key || InDB.isString(  key ) ), 'Key needs to be a string' );  
			InDB.assert( ( !autoinc_key || InDB.isBoolean( autoinc_key ) ), 'Autoinc_key (whether the key uses a generator) needs to be a boolean' );  
			if( "undefined" === typeof autoinc_key || InDB.isBoolean( autoinc_key ) ) { 
				autoinc_key = false; 
			}
			InDB.store.create( store, key, autoinc_key, on_success, on_error, on_abort );
		}
	}

};

InDB.store.options = function ( key, autoinc_key ) {
	//TODO: Assertions key is valid string; autoinc_key is bool (isBoolean?)
	var obj = { 
		'keyPath': ( !!key ) ? key : null
		//, autoIncrement: ( !!key && autoinc_key ) ? true : false
	};
	console.log( "obj", obj );
	return obj;
}

/* return true if request is successfully requested (no bearing on result)
/* autoinc_key defaults to false if a key is specified;
   key gets set to "key" and autoincrements when key is not specified */
InDB.store.create = function ( name, key, autoinc_key, on_success, on_error, on_abort ) {

	console.log("InDB.store.create", name, key, autoinc_key, on_success, on_error, on_abort );

	/* Assertions */	
	if( !InDB.assert( !InDB.isEmpty( name ), "object store name should not be empty" ) ) { 
		return false;
	}
	if( !InDB.assert( !InDB.store.exists( name ) , "object store should not already exist" ) ) { 
		return false;
	}

	var keyPath = {};
	if( !key ) {
		autoinc_key = false;
	} else {
		keyPath = { "keyPath": key };	
	}

	if ( !autoinc_key ) {
		autoinc_key = false;
	}

	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	
	/* database changes must happen w/in a setVersion transaction */
	var setVersionRequest = InDB.db.setVersion( parseInt( InDB.db.version, 10 ) + 1 );
	setVersionRequest.onsuccess = function ( event ) {
		try {
			//missing autoinc_key as third arg
			InDB.db.createObjectStore( name, keyPath );
			// not reachable when createObjectStore throws an error
			on_success( event );
			InDB.trigger( "InDB_store_created_success", { "name": name, "keyPath": keyPath, "autoinc_key": autoinc_key } );
		} catch( error ) {
			// createdObject store threw an error 
			on_error( error );
			InDB.trigger( "InDB_store_created_error", { "name": name, "keyPath": keyPath, "autoinc_key": autoinc_key } );
			//if already created, then the store already exists
			if( IDBDatabaseException.CONSTRAINT_ERR === error.code ) {
				InDB.trigger( "InDB_store_already_exists", { "name": name, "keyPath": keyPath, "autoinc_key": autoinc_key } );
			}
		}
	};
	setVersionRequest.onerror = function ( event ) {
		on_error( event );
		InDB.trigger( "InDB_store_created_error", { "name": name, "keyPath": keyPath, "autoinc_key": autoinc_key } );
	}
	setVersionRequest.onabort = function ( event ) {
		on_abort( event );
		InDB.trigger( "InDB_store_created_abort", { "name": name, "keyPath": keyPath, "autoinc_key": autoautoinc_key } );
	}
	return true;
}

/* unique defaults to false if not present */
InDB.index.create = function ( store, property, name, unique, on_complete, on_success, on_abort ) {
	
	/* Begin Assertions */	
	if( !InDB.assert( !InDB.isEmpty( store ), "object store name cannot be empty" ) ) { 
		return;
	}
	if( !InDB.assert( !InDB.isEmpty( property ), "index key property cannot be empty" ) ) { 
		return;
	}
	if( !InDB.assert( !InDB.isEmpty( name ), "index name cannot be empty" ) ) { 
		return;
	}
	/* End Assertions */

	/* Begin Defaults */	
	if( "undefined" === typeof unique ) {
		unique = false;	
	}
	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	/* End Defaults */

	var databaseTransaction = InDB.store.transaction( store );
	/* Database changes need to happen from w/in a setVersionRequest */
        var setVersionRequest = InDB.db.setVersion( parseInt( InDB.db.version, 10 ) + 1 );
	setVersionRequest.onsuccess = function ( event ) {
		databaseTransaction.createIndex( name, property, {
			"unique": unique
		});
		databaseTransaction.onsuccess = function ( event ) {
			on_success( event );
			InDB.trigger( 'index_created_success', { "database": database, "property": property, "name": name, "unique": unique } );
		};
		databaseTransaction.onerror = function ( event ) {
			on_error( event );
			InDB.trigger( 'index_created_error', { "database": database, "property": property, "name": name, "unique": unique } );
		};
		databaseTransaction.onabort = function ( event ) {
			on_abort( event );
			InDB.trigger( 'index_created_abort', { "database": database, "property": property, "name": name, "unique": unique } );
		};		
	};
	setVersionRequest.onerror = function ( event ) {
		on_error( event );
	};
	setVersionRequest.onabort = function ( event ) {
		on_abort( event );
	};

}

InDB.database.open = function ( name, description, on_success, on_error, on_abort ) {
	InDB.trigger( 'InDB_open_database', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	var open_database_request = window.indexedDB.open( name, description );
	database_open_request.onsuccess = function ( event ) {
		InDB.trigger( 'InDB_open_database_success', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_success( event );
	};
	database_open_request.onerror = function ( event ) {
		InDB.trigger( 'InDB_open_database_error', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_error( event );
	}
	database_open_request.onabort = function ( event ) {
		InDB.trigger( 'InDB_open_database_abort', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_abort( event );
	}
}

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
InDB.transaction.create = function ( database_name, type, on_complete, on_error, on_abort ) {
	InDB.trigger( 'InDB_create_transaction', { "name": name, "type": type, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );		
	if( "undefined" === typeof type ) {
		type = IDBTransaction.READ_WRITE;
	}
	if( "undefined" === typeof timeout ) {
		timeout = 1000;
	}
	if( "undefined" === typeof on_complete ) {
		on_complete = InDB.events.onComplete;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	try {
		if( !!InDB.debug ) {
			console.log( "InDB.db.transaction", database_name, type, timeout );
		}
		var transaction = InDB.db.transaction( [ database_name ], type, timeout );
		transaction.oncomplete = function ( event ) {
			on_complete( event );
			InDB.trigger( 'transaction_complete', { "database": database_name, "type": type, "timeout": timeout } );
		};
		transaction.onerror = function ( event ) {
			on_error( event );
			InDB.trigger( 'transaction_error', { "database": database_name, "type": type, "timeout": timeout } );
		};
		transaction.onabort = function ( event ) {
			on_abort( event );
			InDB.trigger( 'transaction_abort', { "database": database_name, "type": type, "timeout": timeout } );
		};
		return transaction.objectStore( database_name );
	} catch ( event ) {
		return event;
	};
}

InDB.result = function ( event ) {
	if( "undefined" !== typeof event.result ) {
		return event.result;
	} else {
		return null;
	}
}

InDB.value = function ( event ) {
	if( "undefined" !== typeof event.result && "undefined" !== typeof event.result.value ) {
		return event.result.value;
	} else {
		return null;
	}
}

InDB.row.get = function ( database, key, index, on_success, on_error, on_abort ) {
	InDB.trigger( 'InDB_get_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	var transaction = InDB.store.transaction( database, InDB.transaction.read() );
	var get_request = {};
	if( "undefined" !== typeof index || null === index ) {
		var transaction_index = transaction.index( index );
		get_request = transaction_index.get( key );
	} else {
		get_request = transaction.get( key );
	}
			
	get_request.onsuccess = function ( event ) {	
		on_success( event );
		InDB.trigger( 'get_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}
	get_request.onerror = function ( event ) {	
		on_error( event );
		InDB.trigger( 'get_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

	get_request.onabort = function ( event ) {	
		on_abort( event );
		InDB.trigger( 'get_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}
}

InDB.row.remove = function ( database, key, index, on_success, on_error, on_abort ) {
	InDB.trigger( 'set_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	var transaction = InDB.store.transaction( database, InDB.transaction.write() );
	var set_request = transaction[ "delete" ]( key );
	
	get_request.onsuccess = function ( event ) {	
		on_success( event );
		InDB.trigger( 'set_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}
	get_request.onerror = function ( event ) {	
		on_error( event );
		InDB.trigger( 'set_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

	get_request.onabort = function ( event ) {	
		on_abort( event );
		InDB.trigger( 'set_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

}

InDB.database.errorType = function ( code ) {

	if( 8 === code ) {
		return "Request aborted";
	} else if( 4 === code ) {
		return "Already exists";
	} else if( 13 === code ) {
		return "Deadlock";
	} else if( 2 === code ) {
		return "Not allowed";
	} else if( 6 === code ) {
		return "Not allowed";
	} else if( 3 === code ) {
		return "Not found";
	} else if( 9 === code ) {
		return "Read only";
	} else if( 10 === code ) {
		return "Application failure";
	} else if( 11 === code ) {
		return "Data serialization error";
	} else if( 12 === code ) {
		return "Timeout";
	} else if( 7 === code ) {
		return "Transaction inactive";
	} else if( 11 === code ) {
		return "Temporary issue";
	} else if( 1 === code ) {
		return "Unknown error";
	}

}

/* Adds a data object to an object store */
InDB.row.add = function ( store, data, key, on_success, on_error, on_abort ) {

	//TODO: Assertions

	if( !InDB.assert( !InDB.isEmpty( data ), "Cannot add an empty object" ) ) {
		return;
	}

	if( InDB.isEmpty( key ) ) {
		key = null;
	}

	InDB.trigger( 'InDB_row_adding', { "store": store, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );

	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	var transaction = InDB.transaction.create( store, InDB.transaction.read_write() );
	if( !!InDB.debug ) {
		console.log( 'Add transaction', data, transaction );
	}

	//use this[ 'format' ] for function invocation to avoid a Closure compiler error
	try {
		var set_request = transaction[ 'add' ]( data );
		set_request.onsuccess = function ( event ) {	
			on_success( event );
			InDB.trigger( 'InDB_row_added_success', { "event": event, "store": store, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		}
		set_request.onerror = function ( event ) {
			on_error( event );
			InDB.trigger( 'InDB_row_added_error', { "event": event, "store": store, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		}
		set_request.onabort = function ( event ) {
			on_abort( event );
			InDB.trigger( 'InDB_row_added_abort', { "event": event, "store": store, "data": data, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		}
	} catch( error ) {
		if( !!InDB.debug ) {
			console.log( error );
			console.log( 'errorType', InDB.database.errorType( error.code ) );
		}
	}
}

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
	if( !!InDB.debug ) {
		console.log( 'InDB.range.get', value, left_bound, right_bound, includes_left_bound, includes_right_bound );
	}
	if( !!left_bound && !!right_bound && !!includes_left_bound && !!includes_right_bound ) {	
		return IDBKeyRange.bound( left_bound, right_bound, includes_left_bound, includes_right_bound );	
	} else if ( !!left_bound && !!includes_left_bound ) {
		return IDBKeyRange.bound( left_bound, null, includes_left_bound, null );	
		//return IDBKeyRange.leftBound( left_bound, includes_left_bound );
	} else if ( !!right_bound && !!includes_right_bound ) {
		return IDBKeyRange.bound( null, right_bound, null, includes_right_bound );	
		//return IDBKeyRange.rightBound( right_bound, includes_right_bound );
	} else if( !!value ) {
		return IDBKeyRange.only( value );
	}  else {
		return false;
	}
}

InDB.cursor.get = function ( database, index, key_range, on_success, on_error, on_abort ) {

	if( !!InDB.debug ) {
		console.log( 'InDB.cursor.get', database, index, key_range, on_success, on_error, on_abort );
	}

	InDB.trigger( 'InDB_range_gets', { "database": database, "key_range": key_range, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );

	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}
	var transaction = InDB.transaction.create( database, InDB.transaction.read_write() );
	if( !!InDB.debug ) {
		console.log( 'InDB.cursor.get transaction', transaction, index, typeof index );
	}
	var get_rows_request;
	if( "undefined" !== typeof index && !InDB.isEmpty( index ) ) {
		if( !!InDB.debug ) {
			console.log( 'transaction_index.openCursor', index, key_range );
		}
		var transaction_index = transaction.index( index );
		get_rows_request = transaction_index.openCursor( key_range );
	} else {
		if( !!InDB.debug ) {
			console.log( 'transaction.openCursor', key_range );
		}
		get_rows_request = transaction.openCursor( key_range );
	}

	get_rows_request.onsuccess = function ( event ) {	
		on_success( event ); 
		InDB.trigger( 'InDB_range_get_success', { 'event': event, "database": database, "key_range": key_range, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
//		try {
			//load the next row
			var result = event.target.result;
			if( "undefined" !== typeof result.value ) {
				result[ 'continue' ]();
			}
//		} catch ( error ) {
//			InDB.trigger( 'InDB_range_gets_success', { 'event': event, "database": database, "key_range": key_range, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
			//rows exhausted
//			return;
//		}

	}
	get_rows_request.onerror = function ( event ) {	
		on_error( event );
		InDB.trigger( 'InDB_range_gets_error', { 'event': event, "database": database, "key_range": key_range, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

	get_rows_request.onabort = function ( event ) {	
		on_abort( event );
		InDB.trigger( 'InDB_range_gets_abort', { 'event': event, "database": database, "key_range": key_range, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

}

/* End Functions */
