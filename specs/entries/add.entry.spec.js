
(function(){
	'use strict';
	fdescribe("add.entry", function() {
		describe( 'should open a database, add a store and an index to it with default parameters', function() {
			var start_time = new Date().getTime(),
				db_name = 'entry-add-test-' + start_time,
				store_name = 'entry-add-test-store-' + start_time,
				key_path = 'entry' + start_time,
				add_response = {},
				test_data = { test: 'entry-add' },
				error = false,
				success = false,
				notify = false,
				isFinished = false,
				entry_key,
				successes = 0,
				errors = 0,
				notifies = 0,
				ctx;	
			test_data[key_path] = 'entry-add-value-' + start_time;
			beforeEach(function(done) {
	            dash.add.entry({
	                database: db_name,
	                store: store_name,
	                store_key_path: key_path,
	                data: test_data
	            })
	            (function(context) {
	                ctx = context;
	                successes += 1;
	                add_response = context;
	                entry_key = context.key;
	                success = true;
	                done();
	            }, function(context) {
	                ctx = context;
	               	errors += 1;
	                error = true;
	            }, function(context) {
	            	notify = true;
	            	notifies += 1;
	            });
			});

			describe('add.entry should complete', function() {
				beforeEach(function(done) {
					this.context = add_response;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					this.storename = store_name;
					this.keypath = key_path;
					this.key = test_data[key_path];
					this.data = test_data;
					this.successes = successes;
					this.errors = errors;
					this.notifies = notifies;
					done();
				});
				
				it("add.entry should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(this.successes).toBe(1);
				});

				it("add.entry should have the correct parent/child relationships", function() {
					expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
				});

				it("add.entry references should be the db, store and index we asked for", function(){
					expect(this.context.db.name).toBe(this.dbname);
					expect(this.context.objectstore.name).toBe(this.storename);
				});
				
				it("add.entry should return the key", function(){
					expect(this.context.key).toBe(this.key);
				});

				it("add.entry should clean up after itself", function() {
					dash.remove.database(this.context);
				});

			});
		});

	});
}());

