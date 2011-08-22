/**
 * InDB by Taylor Buley
 * Github -> http://github.com/editor/indb 
 * Twitter -> @taylorbuley
 **/


/**
 * Namespaces:
 *   Indb - application namespace
 *   Indb.db - namespace for the open IndexedDB instance (IDBFactory)
 *   Indb.dbs = namespace for object stores (IDBObjectStore)
 *   Indb.database - namepspace for database methods (IDBDatabase)
 *   Indb.store - namespace for objectStore methods
 *   Indb.index - namespace for index methods (IDBIndex)
 *   Indb.transaction - namespace for key range methods (IDBTransaction)
 *   Indb.range - namespace for key range methods (IDBKeyRange)
 *   Indb.row - namespace for row methods
 *   Indb.cursor - namespace for rows methods (IDBCursor)
 *   Indb.events - namespace for event and error methods (IDBEvent, IDBSuccessEvent, IDBErrorEvent, IDBDatabaseError and IDBDatabaseException)
 **/

/* Begin Namespaces */
InDB = {};
InDB.factory = {};
InDB.db = {};
InDB.database = {};
InDB.stores = {};
InDB.index = {};
InDB.range = {};
InDB.row = {};
InDB.cursor = {};
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
 *   InDB.database.version (int) - database version
 *   InDB.events.on_success (function) - generic success callback
 *   InDB.events.onComplete (function) - generic complete callback
 *   InDB.events.onError (function)- generic error callback
 *   InDB.events.onAbort (function) - generic abort callback
 */

/* Begin Defaults */
InDB.database.version = 1;
InDB.events.onComplete = function( e ) { console.log( "IndexedDB request completed" ); console.log( e ); }
InDB.events.onSuccess = function( e ) { console.log( "IndexedDB request successful" ); console.log( e ); }
InDB.events.onError = function( e ) { console.log( "IndexedDB request errored" ); console.log( e ); }
InDB.events.onAbort = function( e ) { console.log( "IndexedDB request aborted" ); console.log( e ); }
/* End Defaults */

/* Begin Onload */

/* End Onload */

/* Begin Functions */

/* Begin InDB Methods */
/**
 * InDB.browserSupported( )  > support level (int): [ -1, 0, 1 ]
 *  Checks to see if IndexedDB is supported
 *  returns 1 if fully supported, 0 if supported w/fixes, and -1 if unsupported
 **/

InDB.database.load = function( name, description, on_success, on_error, on_abort ) {

	/* Assertions */	
	if( !InDB.assert( !InDB.isEmpty( name ), "database name cannot be empty" ) ) { 
		return;
	}
	if( !InDB.assert( !InDB.isEmpty( description ), "database description cannot be empty" ) ) { 
		return;
	}

	/* Begin Debug */
	if( !!InDB.debug ) {
		console.log( "InDB.database.load", name, description, on_success, on_error, on_abort );
	}
	/* End Debug */

	if( "undefined" === typeof on_success ) {
		on_success = InDB.events.onSuccess;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.events.onError;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.events.onAbort;
	}

	/* Begin Debug */
	if( !!InDB.debug ) {
		console.log( "InDB.database.load", name, description, on_success, on_error, on_abort );
	}
	/* End Debug */

	if( typeof InDB.db === "IDBDatabase" ) {
		//database already loaded
		jQuery( document ).trigger( 'InDB_database_loaded' );
	} else {
		var open_request = window.indexedDB.open( name, description );
		open_request.onsuccess = function( event ) {
			InDB.db = event.target.result;
			on_success( event );
			jQuery( document ).trigger( 'InDB_database_loaded' );
		}
		open_request.onerror = function( event ) {
			on_error( event );
			jQuery( document ).trigger( 'InDB_database_loaded_error' );
		}
		open_request.onabort = function( event ) {
			jQuery( document ).trigger( 'InDB_database_loaded_error' );
			on_abort( event );
		}
	}
}

InDB.checkBrowser = function() {
	jQuery( document ).trigger( 'doing_browserSupported' );		
	var result = -1;
	// the support check
	if( !!window.webkitIndexedDB || !!window.mozIndexedDB ) {
		result = 0;
	} else if(!!window.indexedDB ) {
		result = 1;
	}
	//TODO: Allow filter
	//TODO: Check if anything is listening; else don't filter
	//result = jQuery( document ).trigger( 'Indb_did_browserSupported', { "result": result } );
	jQuery( document ).trigger( 'InDB_did_browserSupported', { "result": result } );
	return result;
}

/**
 * InDB.assert( statement, string, string ) - handy little tool for unit tests
 * statement (mixed): whatever you want to evaluate
 * warn_level (string): log, alert or *error (*default) 
 *
 **/
InDB.assert = function( statement, error_message, warn_level ) {

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
InDB.isEmpty = function( mixed_var ) {
	return ( "undefined" !== typeof "mixed_var" && null !== mixed_var && "" !== mixed_var ) ? false : true;
}

/* InDB.fixBrowser( ) -> null 
 * Sets up expermental interfaces if necessary. For use when a browser has not yet implemented the native (window.IndexedDB) dom interface, which is detectable if InDB.browser_supported returns -1. */
InDB.fixBrowser = function() {
	jQuery( document ).trigger( 'doing_fixBrowser' );		
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

/* auto_incrementing_key defaults to false if a key is specified;
   key gets set to "key" and autoincrements when key is not specified */
InDB.stores.create = function( name, key, auto_incrementing_key, on_success, on_error, on_abort ) {

	/* Assertions */	
	if( !InDB.assert( !InDB.isEmpty( name ), "object store name cannot be empty" ) ) { 
		return;
	}

	var keyPath = {};
	if( !key ) {
		keyPath = { "keyPath": "key" };
		auto_incrementing_key = true;
	} else if ( !auto_incrementing_key ) {
		auto_incrementing_key = false;
	} else {
		keyPath = { "keyPath": key };	
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
        var setVersionRequest = InDB.db.setVersion( parseInt( InDB.version, 10 ) );
	setVersionRequest.onsuccess = function( event ) {
		var transaction = InDB.db.createObjectStore( name, keyPath, auto_incrementing_key );
		transaction.onsuccess = function( event ) {
			on_success( event );
			jQuery( document ).trigger( "database_created_success", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
		}
		transaction.onerror = function( event ) {
			on_error( event );
			jQuery( document ).trigger( "database_created_error", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
		}
		transaction.onabort = function( event ) {
			on_abort( event );
			jQuery( document ).trigger( "database_created_abort", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
		}

	};
	setVersionRequest.onerror = function( event ) {
		on_error( event );
		jQuery( document ).trigger( "database_created_error", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
	}
	setVersionRequest.onabort = function( event ) {
		on_abort( event );
		jQuery( document ).trigger( "database_created_abort", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
	}
}

/* unique defaults to false if not present */
InDB.index.create = function( store, property, name, unique, on_complete, on_success, on_abort ) {
	
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
        var setVersionRequest = InDB.db.setVersion( parseInt( InDB.version, 10 ) );
	setVersionRequest.onsuccess = function ( event ) {
		databaseTransaction.createIndex( name, property, {
			"unique": unique
		});
		databaseTransaction.onsuccess = function( event ) {
			on_success( event );
			jQuery( document ).trigger( 'index_created_success', { "database": database, "property": property, "name": name, "unique": unique } );
		};
		databaseTransaction.onerror = function( event ) {
			on_error( event );
			jQuery( document ).trigger( 'index_created_error', { "database": database, "property": property, "name": name, "unique": unique } );
		};
		databaseTransaction.onabort = function( event ) {
			on_abort( event );
			jQuery( document ).trigger( 'index_created_abort', { "database": database, "property": property, "name": name, "unique": unique } );
		};		
	};
	setVersionRequest.onerror = function( event ) {
		on_error( event );
	};
	setVersionRequest.onabort = function( event ) {
		on_abort( event );
	};

}

InDB.database.open = function( name, description, on_success, on_error, on_abort ) {
	jQuery(document).trigger( 'InDB_open_database', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
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
	database_open_request.onsuccess = function( event ) {
		jQuery(document).trigger( 'InDB_open_database_success', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_success( event );
	};
	database_open_request.onerror = function( event ) {
		jQuery(document).trigger( 'InDB_open_database_error', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_error( event );
	}
	database_open_request.onabort = function( event ) {
		jQuery(document).trigger( 'InDB_open_database_abort', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_abort( event );
	}
}

/* Transaction types */
InDB.transaction.read = function() {
	return IDBTransaction.READ_ONLY;
} 
InDB.transaction.read_write = function() {
	return IDBTransaction.READ_WRITE;
} 
InDB.transaction.write = function() {
	return IDBTransaction.READ_WRITE;
} 

/* Transaction factory */
InDB.transaction.create = function( database_name, type, on_complete, on_error, on_abort ) {
	jQuery(document).trigger( 'InDB_create_transaction', { "name": name, "type": type, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );		
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
		var transaction = Buleys.db.transaction( [ database_name ], type, timeout );
		transaction.oncomplete = function( event ) {
			on_complete( event );
			jQuery( document ).trigger( 'transaction_complete', { "database": database_name, "type": type, "timeout": timeout } );
		};
		transaction.onerror = function( event ) {
			on_error( event );
			jQuery( document ).trigger( 'transaction_error', { "database": database_name, "type": type, "timeout": timeout } );
		};
		transaction.onabort = function( event ) {
			on_abort( event );
			jQuery( document ).trigger( 'transaction_abort', { "database": database_name, "type": type, "timeout": timeout } );
		};
		return transaction.objectStore( database_name );
	} catch ( event ) {
		return event;
	};
}

InDB.result = function( event ) {
	if( "undefined" !== typeof event.result ) {
		return event.result;
	} else {
		return null;
	}
}

InDB.value = function( event ) {
	if( "undefined" !== typeof event.result && "undefined" !== typeof event.result.value ) {
		return event.result.value;
	} else {
		return null;
	}
}

InDB.row.get = function( database, key, index, on_success, on_error, on_abort ) {
	jQuery(document).trigger( 'InDB_get_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
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
			
	get_request.onsuccess = function( event ) {	
		on_success( event );
		jQuery( document ).trigger( 'get_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}
	get_request.onerror = function( event ) {	
		on_error( event );
		jQuery( document ).trigger( 'get_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

	get_request.onabort = function( event ) {	
		on_abort( event );
		jQuery( document ).trigger( 'get_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

}


InDB.row.remove = function( database, key, index, on_success, on_error, on_abort ) {
	jQuery(document).trigger( 'set_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
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
	
	get_request.onsuccess = function( event ) {	
		on_success( event );
		jQuery( document ).trigger( 'set_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}
	get_request.onerror = function( event ) {	
		on_error( event );
		jQuery( document ).trigger( 'set_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

	get_request.onabort = function( event ) {	
		on_abort( event );
		jQuery( document ).trigger( 'set_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

}

InDB.row.add = function( database, key, index, on_success, on_error, on_abort ) {
	jQuery(document).trigger( 'set_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
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
	var set_request = transaction.add( key );
	
	get_request.onsuccess = function( event ) {	
		on_success( event );
		jQuery( document ).trigger( 'set_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}
	get_request.onerror = function( event ) {	
		on_error( event );
		jQuery( document ).trigger( 'set_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

	get_request.onabort = function( event ) {	
		on_abort( event );
		jQuery( document ).trigger( 'set_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

}

/* Key range helpers */
InDB.range.only = function( value ) {
	return InDB.range.get( value, null, null, null, null );
}
InDB.range.left = function( left_bound ) {
	return InDB.range.get( null, left_bound, null, false, null );
}
InDB.range.left_open = function( left_bound ) {
	return InDB.range.get( null, left_bound, null, true, null );
}
InDB.range.right = function( right_bound ) {
	return InDB.range.get( null, null, right_bound, null, false );
}
InDB.range.right_open = function( right_bound ) {
	return InDB.range.get( null, null, right_bound, null, true );
}

/* returns an IDBKeyRange given a range type
 * returns false if type is not valid;
 * valid types: bound, leftBound, only, rightBound */
/* uses duck typing to determine key type */
/* more info: https://developer.mozilla.org/en/indexeddb/idbkeyrange*/
InDB.range.get = function( value, left_bound, right_bound, includes_left_bound, includes_right_bound ) {
	if( !!left_bound && !!right_bound && !!includes_left_bound && !!includes_right_bound ) {	
		return IDBKeyRange.bound( left_bound, right_bound, includes_left_bound, includes_right_bound );	
	} else if ( !!left_bound && !!includes_left_bound ) {
		return IDBKeyRange.leftBound( left_bound, includes_left_bound );
	} else if ( !!right_bound && !!includes_right_bound ) {
		return IDBKeyRange.rightBound( right_bound, includes_right_bound );
	} else if( !!value ) {
		return IDBKeyRange.only( value );
	}  else {
		return false;
	}
}

InDB.cursor.get = function( database, index, key_range, on_success, on_error, on_abort ) {

	jQuery(document).trigger( 'InDB_get_rows', { "database": database, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );

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
	var get_rows_request = {};
	if( "undefined" !== typeof index || null === index ) {
		var transaction_index = transaction.index( index );
		get_rows_request = transaction_index.openCursor( key_range );
	} else {
		get_rows_request = transaction.openCursor( key_range );
	}

	get_rows_request.onsuccess = function( event ) {	
		on_success( event ); 
		var result = event.target.result;
		var item = result.value; 
		map( item );
		try {
			//load the next row
			result[ 'continue' ]();
		} catch ( error ) {
			//rows exhausted
			return;
		}
		jQuery(document).trigger( 'InDB_get_rows_success', { 'event': event, "database": database, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}
	get_rows_request.onerror = function( event ) {	
		on_error( event );
		jQuery(document).trigger( 'InDB_get_rows_error', { 'event': event, "database": database, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

	get_rows_request.onabort = function( event ) {	
		on_abort( event );
		jQuery(document).trigger( 'InDB_get_rows_abort', { 'event': event, "database": database, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
	}

}

/* End Functions */
