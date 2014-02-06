(function(){
	'use strict';
	describe("add.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-add-test-' + start_time,
			store_name = 'store-add-test-store-' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			ctx;	
		it( 'should open a database then add a store', function() {
			dash.open.database({ database: db_name, store: store_name })
				.then(dash.add.store)
				.then(function(context) {
					ctx = context;
					success = true;
					isFinished = true;
				}, function(context) {
					ctx = context;
					error = true;
					isFinished = true;
				}, function(context) {
					notify = true;
				})
			waitsFor(dashIsFinished, 'the add.store operation to finish', 10000);
			runs(function() {
				describe('add.store should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
					});
					
					it("add.store should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("add.store should have the correct references", function() {
						expect(this.context.db instanceof IDBDatabase).toBe(true);
						expect(this.context.objectstore instanceof IDBObjectStore).toBe(true);
					});
					
					it("add.store should have the correct parent/child relationship", function() {
						expect(this.context.db.objectStoreNames.contains(this.context.store)).toBe(true);
					});

					it("add.store references should be the db and store we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});

					it("add.store objectstore should have default properties", function(){
						expect(this.context.objectstore.keyPath).toBe(null);
					});

					it("add.store should clean up after itself", function() {
						dash.remove.store(this.context).then(dash.close.database);
					});

				});
			});

		});
	});
}());

