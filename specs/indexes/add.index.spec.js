
(function(){
	'use strict';
	describe("add.index", function() {
		var start_time = new Date().getTime(),
			db_name = 'idx-create-test-' + start_time,
			store_name = 'idx-create-test-store-' + start_time,
			index_name = 'idx-create-text' + start_time,
			key_path = 'idx' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			ctx;	
		it( 'should open a database, add a store and an index to it', function() {
			dash.open.database({ database: db_name, store: store_name, index: index_name, index_key_path: key_path })
				.then(dash.add.store)
				.then(dash.add.index)
				.then(function(context) {
					success = true;
					isFinished = true;
					ctx = context;
				}, function(context) {
					ctx = context;
					error = true;
					isFinished = true;
				}, function(context) {
					notify = true;
				})
			waitsFor(dashIsFinished, 'the add.index operation to finish', 10000);
			runs(function() {
				describe('add.index should finish cleanly', function() {

					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
						this.indexname = index_name;
						this.keypath = key_path;
					});
					
					it("add.index should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("add.index should have the correct references", function() {
						expect(this.context.db instanceof IDBDatabase).toBe(true);
						expect(this.context.objectstore instanceof IDBObjectStore).toBe(true);
						expect(this.context.idx instanceof IDBIndex).toBe(true);
					});

					it("add.index should have the correct parent/child relationships", function() {
						expect(this.context.db.objectStoreNames.contains(this.context.store)).toBe(true);
						expect(this.context.objectstore.indexNames.contains(this.context.index)).toBe(true);
					});

					it("add.index references should be the db, store and index we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
						expect(this.context.idx.name).toBe(this.indexname);
					});

					it("add.index idx should have correct properties", function(){
						expect(this.context.idx.multiEntry).toBe(false);
						expect(this.context.idx.unique).toBe(false);
						expect(this.context.idx.keyPath).toBe(this.keypath);
					});

					it("add.index should clean up after itself", function() {
						dash.remove.index(this.context)
							.then(dash.remove.store)
							.then(dash.close.database)
							.then(dash.remove.database);
					});

				});
			});

		});
	});
}());

