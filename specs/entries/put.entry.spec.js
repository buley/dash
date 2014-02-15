
(function(){
	'use strict';
	describe("put.entry", function() {
		it( 'should open a database, add a store and an index to it with default parameters', function() {
			var start_time = new Date().getTime(),
				db_name = 'entry-put-test-' + start_time,
				store_name = 'entry-put-test-store-' + start_time,
				key_path = 'entry' + start_time,
				test_data = { version: 1 },
				isFinished = false,
				dashIsFinished = function() { 
					return isFinished;
				},
				error = false,
				success = false,
				notify = false,
				ctx,
				key;
			test_data[key_path] = 'entry-put-1-' + start_time;
            dash.add.store({
                database: db_name,
                store: store_name,
                store_key_path: key_path,
                data: test_data
            })
            .then(function(context) {
                console.log('added rntry');
                dash.add.entry(context)
                .then(function(context) {
                    key = context.key;
                    delete context.key;
                    context.data = { version: 2 };
                    context.data[key_path] = 'entry-put-1-' + start_time;
                    console.log('putting');
                    dash.put.entry(context)
                    .then(function(context) {
                        console.log('dash get');
                        dash.get.entry(context)
                        .then(function(context) {
                            ctx = context;
                            isFinished = true;
                            success = true;
                        });
                    }, function(context) {
                        isFinished = true;
                        error = true;
                    });
                }, function(context) {
                    isFinished = true;
                    error = true;
                });
            }, function(context) {
                isFinished = true;
                error = true;
            });

			waitsFor(dashIsFinished, 'the put.entry operation to finish', 10000);
			runs(function() {
				describe('put.entry should finish cleanly', function() {

					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
						this.keypath = key_path;
						this.key = test_data[key_path];
						this.data = test_data;
					});
					
					it("put.entry should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("put.entry should have the correct references", function() {
						expect(this.context.db instanceof IDBDatabase).toBe(true);
						expect(this.context.objectstore instanceof IDBObjectStore).toBe(true);
					});

					it("put.entry should have the correct parent/child relationships", function() {
						expect(this.context.db.objectStoreNames.contains(this.context.store)).toBe(true);
					});

					it("put.entry references should be the db, store and index we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});

					it("put.entry should have updated the entry by key", function(){
						expect(this.context.entry.version).toBe(2);
					});
					
					it("put.entry should return the key", function(){
						expect(this.context.key).toBe(this.key);
					});

					it("put.entry should clean up after itself", function() {
						//dash.remove.database(this.context);
					});

				});
			});

		});

	});
}());

