(function(){
	'use strict';
	describe("remove.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-remove-test-' + start_time,
			store_name = 'store-remove-test-store-' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			seconderror = false,
			secondsuccess = false,
			secondnotify = false,
			success = false,
			notify = false,
			prectx,
			ctx;	
		it( 'should open a database then add and then get a store', function() {
			dash.open.database({ database: db_name, store: store_name })
				.then(dash.add.store)
				.then(dash.get.store)
				.then(dash.remove.store)
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
			waitsFor(dashIsFinished, 'the remove.store operation to finish', 3000);
			runs(function() {
				describe('remove.store should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.setup = prectx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
					});
					
					it("remove.store should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("remove.store should have the correct references", function() {
						expect(this.context.db instanceof IDBDatabase).toBe(true);
						expect(this.context.objectstore instanceof IDBObjectStore).toBe(true);
					});
					
					it("remove.store should have the correct parent/child relationship", function() {
						expect(this.context.db.objectStoreNames.contains(this.context.store)).toBe(false);
					});

					it("remove.store references should be the db and store we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});

					it("remove.store should clean up after itself", function() {
						dash.remove.store(this.context)
						.then(dash.close.database)
						.then(dash.remove.database);
					});

				});
			});

		});
	});
}());

