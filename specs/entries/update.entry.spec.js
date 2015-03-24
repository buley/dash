
(function(){
	'use strict';
	describe("update.entry", function() {
		it( 'should open a database, add a store and an index to it with default parameters', function() {
			var start_time = new Date().getTime(),
				db_name = 'entry-update-test-' + start_time,
				store_name = 'entry-update-test-store-' + start_time,
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
			test_data[key_path] = 'entry-update-1-' + start_time;
             dash.add.entry({
                database: db_name,
                store: store_name,
                store_key_path: key_path,
                data: test_data
            })
            (function(context) {
                key = context.key;
                delete context.key;
                context.data = { version: 2 };
                context.data[key_path] = 'entry-update-1-' + start_time;
                dash.update.entry(context)
                (function(context) {
                    dash.get.entry(context)
                    (function(context) {
                        ctx = context;
                        isFinished = true;
                        success = true;
                        done();
                    });
                }, function(context) {
                    isFinished = true;
                    error = true;
                    done();
                });
            }, function(context) {
                isFinished = true;
                error = true;
                done();
            });

			it('the update.entry operation to finish', function() {
				describe('update.entry should finish cleanly', function() {

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
					
					it("update.entry should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("update.entry should have the correct parent/child relationships", function() {
						expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					});

					it("update.entry references should be the db, store and index we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});

					it("update.entry should have updated the entry by key", function(){
						expect(this.context.entry.version).toBe(2);
					});
					
					it("update.entry should return the key", function(){
						expect(this.context.key).toBe(this.key);
					});

					it("update.entry should clean up after itself", function() {
						dash.remove.database(this.context);
					});

				});
			});

		});

	});
}());

