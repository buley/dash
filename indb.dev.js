/*
 * InDB by Taylor Buley
 * Github -> http://github.com/editor/indb 
 * Twitter -> @taylorbuley
 *
 * Namespace: InDB
 * Globals:
 *   InDB.on_success - generic success callback
 *   InDB.on_complete - generic complete callback
 *   InDB.on_error - generic error callback
 *   InDB.on_abort - generic abort callback
 */

InDB.on_complete = function( e ) { console.log( "IndexedDB request completed" ); console.log( e ); }
InDB.on_success = function( e ) { console.log( "IndexedDB request successful" ); console.log( e ); }
InDB.on_error = function( e ) { console.log( "IndexedDB request errored" ); console.log( e ); }
InDB.on_abort = function( e ) { console.log( "IndexedDB request aborted" ); console.log( e ); }

InDB.set_version = function( version ) {
	InDB.version = version;
}

InDB.get_version = function( version ) {
	return InDB.version;
}

/* returns 1 if fully supported, 0 if supported w/fixes, and -1 if unsupported */
InDB.browserSupported = function() {
	jQuery( document ).trigger( 'doing_check_browser_support' );		
	var result = -1;
	// the support check
	if( "undefined" !== typeof window.webkitIndexedDB ) {
		result = 0;
	} else if( 'mozIndexedDB' in window ) {
		result = 1;
	}
	jQuery( document ).trigger( 'did_check_browser_support', { "result": result } );
	return result;
}

/* sets up expermental interfaces if necessary (i.e. InDB.browser_supported returns -1) */
InDB.fixBrowser = function() {
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

/* takes an object with database name as key and 
 * an object containing indexes as its value; 
 * index object takes key name as key and value is the index request object */
InDB.setupDatabases = function( databases ) {
	jQuery(document).trigger('setup_databases');	
}

/* auto_incrementing_key defaults to false if a key is specified;
   key gets set to "key" and autoincrements when key is not specified */
InDB.createDatabase = function( name, key, auto_incrementing_key, on_success, on_error, on_abort ) {
	/* keyPath XYZ */
	var keyPath = {};
	if( "undefined" === typeof key ) {
		keyPath = { "keyPath": "key" };
		auto_incrementing_key = true;
	} else if ( "undefined" === auto_increment ) {
		auto_incrementint_key = false;
	} else {
		keyPath = { "keyPath": key };	
	}
	if( "undefined" === typeof on_success ) {
		on_success = InDB.on_success;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}
	/* database changes must happen w/in a setVersion transaction */
        var setVersionRequest = window.indexedDB.setVersion( parseInt( InDB.version, 10 ) );
	setVersionRequest.onsuccess = function( event ) {

		window.indexedDB.createObjectStore( name, keyPath, auto_incrementing_key );
		jQuery( document ).trigger( "database_created_success", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
		var transaction = event.result;
		on_success( event );
	};
	setVersionRequest.onerror = function( event ) {
		jQuery( document ).trigger( "database_created_error", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
		on_error( event );
	}
	setVersionRequest.onabort = function( event ) {
		jQuery( document ).trigger( "database_created_abort", { "name": name, "keyPath": keyPath, "auto_incrementing_key": auto_incrementing_key } );
		on_abort( event );
	}
}

/* unique defaults to false if not present */
InDB.create_index = function( database, property, name, unique, on_complete, on_success, on_abort ) {
	if( "undefined" === typeof unique ) {
		unique = false;	
	}
	if( "undefined" === typeof on_success ) {
		on_success = InDB.on_success;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}
	var databaseTransaction = InDB.new_transaction( database );
	/* Database changes need to happen from w/in a setVersionRequest */
        var setVersionRequest = window.indexedDB.setVersion( parseInt( InDB.version, 10 ) );
	setVersionRequest.onsuccess = function ( event ) {
		databaseTransaction.createIndex( name, property, {
			"unique": unique
		});
		databaseTransaction.onsuccess = function( event ) {
			jQuery( document ).trigger( 'index_created_success', { "database": database, "property": property, "name": name, "unique": unique } );
			on_success( event );
		};
		databaseTransaction.onerror = function( event ) {
			jQuery( document ).trigger( 'index_created_error', { "database": database, "property": property, "name": name, "unique": unique } );
			on_error( event );
		};
		databaseTransaction.onabort = function( event ) {
			jQuery( document ).trigger( 'index_created_abort', { "database": database, "property": property, "name": name, "unique": unique } );
			on_abort( event );
		};		
	};
	setVersionRequest.onerror = function( event ) {
		on_error( event );
	};
	setVersionRequest.onabort = function( event ) {
		on_abort( event );
	};

}

InDB.open_database = function( name, description, on_success, on_error, on_abort ) {
	jQuery(document).trigger('open_database', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
	if( "undefined" === typeof on_success ) {
		on_success = InDB.on_success;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}
	var open_database_request = window.indexedDB.open( name, description );
	database_open_request.onsuccess = function( event ) {
		jQuery(document).trigger('open_database_success', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_success( event );
	};
	database_open_request.onerror = function( event ) {
		jQuery(document).trigger('open_database_error', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_error( event );
	}
	database_open_request.onabort = function( event ) {
		jQuery(document).trigger('open_database_abort', { "name": name, "description": description, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );
		on_abort( event );
	}
}

/* Transaction types */
InDB.tx_read = function() {
	return IDBTransaction.READ_ONLY;
} 
InDB.tx_read_write = function() {
	return IDBTransaction.READ_WRITE;
} 
InDB.tx_write = function() {
	return IDBTransaction.READ_WRITE;
} 

/* Transaction factory */
InDB.create_transaction = function( database_name, type, on_complete, on_error, on_abort ) {
	jQuery(document).trigger('create_transaction', { "name": name, "type": type, "on_complete": on_complete, "on_error": on_error, "on_abort": on_abort } );		
	if( "undefined" === typeof type ) {
		type = IDBTransaction.READ_WRITE;
	}
	if( "undefined" === typeof timeout ) {
		timeout = 1000;
	}
	if( "undefined" === typeof on_complete ) {
		on_complete = InDB.on_complete;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}
	try {
		var transaction = Buleys.db.transaction( [ database_name ], type, timeout );
		transaction.oncomplete = function( event ) {
			jQuery( document ).trigger( 'transaction_complete', { "database": database_name, "type": type, "timeout": timeout } );
			on_complete( event );
		};
		transaction.onerror = function( event ) {
			jQuery( document ).trigger( 'transaction_error', { "database": database_name, "type": type, "timeout": timeout } );
			on_error( event );
		};
		transaction.onabort = function( event ) {
			jQuery( document ).trigger( 'transaction_abort', { "database": database_name, "type": type, "timeout": timeout } );
			on_abort( event );
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

InDB.get_row = function( database, key, index, on_success, on_error, on_abort ) {
	jQuery(document).trigger('get_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
	if( "undefined" === typeof on_success ) {
		on_success = InDB.on_success;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}

	var transaction = InDB.new_transaction( database, InDB.tx_read() );
	var get_request = {};
	if( "undefined" !== typeof index || null === index ) {
		var transaction_index = transaction.index( index );
		get_request = transaction_index.get( key );
	} else {
		get_request = transaction.get( key );
	}
			
	get_request.onsuccess = function( event ) {	
		jQuery( document ).trigger( 'get_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_success( event );
	}
	get_request.onerror = function( event ) {	
		jQuery( document ).trigger( 'get_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_error( event );
	}

	get_request.onabort = function( event ) {	
		jQuery( document ).trigger( 'get_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_abort( event );
	}

}


InDB.remove_row = function( database, key, index, on_success, on_error, on_abort ) {
	jQuery(document).trigger( 'set_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
	if( "undefined" === typeof on_success ) {
		on_success = InDB.on_success;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}

	var transaction = InDB.new_transaction( database, InDB.tx_write() );
	var set_request = transaction[ "delete" ]( key );
	
	get_request.onsuccess = function( event ) {	
		jQuery( document ).trigger( 'set_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_success( event );
	}
	get_request.onerror = function( event ) {	
		jQuery( document ).trigger( 'set_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_error( event );
	}

	get_request.onabort = function( event ) {	
		jQuery( document ).trigger( 'set_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_abort( event );
	}

}

InDB.add_row = function( database, key, index, on_success, on_error, on_abort ) {
	jQuery(document).trigger( 'set_record', { "database": database, "key": key, "index": index, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
	if( "undefined" === typeof on_success ) {
		on_success = InDB.on_success;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}

	var transaction = InDB.new_transaction( database, InDB.tx_write() );
	var set_request = transaction.add( key );
	
	get_request.onsuccess = function( event ) {	
		jQuery( document ).trigger( 'set_success', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_success( event );
	}
	get_request.onerror = function( event ) {	
		jQuery( document ).trigger( 'set_error', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_error( event );
	}

	get_request.onabort = function( event ) {	
		jQuery( document ).trigger( 'set_abort', { "event": event, "database": database_name, "key": key, "index": index, "on_success": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_abort( event );
	}

}

/* returns an IDBKeyRange */
InDB.get_key_range = function( type, begin_key, end_key ) {

}

InDB.get_rows = function( database, index, key_range, map, on_success, on_error, on_abort ) {

	jQuery(document).trigger('get_rows', { "database": database, "key": key, "index": index, "map": map, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );

	if( "undefined" === typeof on_success ) {
		on_success = InDB.on_success;
	}
	if( "undefined" === typeof on_error ) {
		on_error = InDB.on_error;
	}
	if( "undefined" === typeof on_abort ) {
		on_abort = InDB.on_abort;
	}

	var transaction = InDB.new_transaction( database, InDB.tx_read() );
	var get_rows_request = {};
	if( "undefined" !== typeof index || null === index ) {
		var transaction_index = transaction.index( index );
		get_rows_request = transaction_index.openCursor( key_range );
	} else {
		get_rows_request = transaction.openCursor( key_range );
	}

	get_rows_request.onsuccess = function( event ) {	
		jQuery(document).trigger('get_rows_success', { 'event': event, "database": database, "key": key, "index": index, "map": map, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
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
	}
	get_rows_request.onerror = function( event ) {	
		jQuery(document).trigger('get_rows_error', { 'event': event, "database": database, "key": key, "index": index, "map": map, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_error( event );
	}

	get_rows_request.onabort = function( event ) {	
		jQuery(document).trigger('get_rows_abort', { 'event': event, "database": database, "key": key, "index": index, "map": map, "on_complete": on_success, "on_error": on_error, "on_abort": on_abort } );
		on_abort( event );
	}

}




/*
		new_categories_transaction();

		Buleys.index = Buleys.objectStoreCategories.index("slug");
		var keyRange = IDBKeyRange.only( slug_filter );
		var cursorRequest = Buleys.index.openCursor( keyRange );

		cursorRequest.onsuccess = function ( event ) {

			if (!event.target.result ) {
				return;
			}

			var result = event.target.result;
			var item = result.value;
			new_seen_transaction();

			var item_request_2 = Buleys.objectStore.get(item.link);
			item_request_2.onsuccess = function ( event1 ) {

				if (typeof event1.target.result !== 'undefined' && make_inverse !== true) {

					if (jQuery("#" + item.link.replace(/[^a-zA-Z0-9-_]+/g, "")).length <= 0) {
						get_item(item.link);
					}

				} else if (typeof event1.target.result == 'undefined' && make_inverse == true) {

					if (jQuery("#" + item.link.replace(/[^a-zA-Z0-9-_]+/g, "")).length <= 0) {
						get_item(item.link);
					}

				}

			};

			result["continue"]();
	    	};
	
	    	cursorRequest.onerror = function ( event ) {
		};
*/

