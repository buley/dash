
(function(){
	'use strict';
	describe("update.entry", function() {
		describe( 'should open a database, add a store and an index to it with default parameters', function() {
			var start_time = new Date().getTime(),
				db_name = 'entry-update-test-' + start_time,
				store_name = 'entry-update-test-store-' + start_time,
				key_path = 'entry' + start_time,
				test_data = { version: 1 },
				error = false,
				success = false,
				notify = false,
				ctx,
				key;
			test_data[key_path] = 'entry-update-1-' + start_time;

			beforeEach(function(done){
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
	                        success = true;
	                        done();
	                    });
	                }, function(context) {
	                    error = true;
	                    done();
	                });
	            }, function(context) {
	                error = true;
	                done();
	            });
			});

			describe('update.entry should finish cleanly', function() {

				beforeEach(function(done) {
					this.context = ctx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					this.storename = store_name;
					this.keypath = key_path;
					this.key = test_data[key_path];
					this.data = test_data;
					done();
				});
				
				it("update.entry should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					expect(this.context.db.name).toBe(this.dbname);
					expect(this.context.objectstore.name).toBe(this.storename);
					expect(this.context.entry.version).toBe(2);
					expect(this.context.key).toBe(this.key);
				});
			});

		});

	});
}());

