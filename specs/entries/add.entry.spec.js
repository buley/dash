
(function(){
	'use strict';
	describe("add.entry", function() {
		it( 'should open a database, add a store and an index to it with default parameters', function() {
			runs(function() {
				var start_time = new Date().getTime(),
					db_name = 'entry-add-test-' + start_time,
					store_name = 'entry-add-test-store-' + start_time,
					key_path = 'entry' + start_time,
					add_response = {},
					test_data = { test: 'entry-add' },
					dashIsFinished = function() { 
						return isFinished;
					},
					error = false,
					success = false,
					notify = false,
					isFinished = false,
					entry_key,
					ctx;	
				test_data[key_path] = 'entry-add-value-' + start_time;
	            dash.add.entry({
	                database: db_name,
	                store: store_name,
	                store_key_path: key_path,
	                data: test_data
	            })
	            .then(function(context) {
	                ctx = context;
	                isFinished = true;
	                add_response = context;
	                console.log('add.entry entry', context.key);
	                entry_key = context.key;
	                success = true;
	            }, function(context) {
	                ctx = context;
	                isFinished = false;
	                error = true;
	            });
				waitsFor(dashIsFinished, 'the add.entry operation to finish', 10000);
				describe('add.entry should complete', function() {
					beforeEach(function() {
						this.context = add_response;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
						this.keypath = key_path;
						this.key = test_data[key_path];
						this.data = test_data;
					});
					
					it("add.entry should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("add.entry should have the correct parent/child relationships", function() {
						expect(this.context.db.objectStoreNames.contains(this.context.store)).toBe(true);
					});

					it("add.entry references should be the db, store and index we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});
					
					it("add.entry should return the key", function(){
						console.log('add.entry checking against',this.context.key);
						expect(this.context.key).toBe(this.key);
					});

					it("add.entry should clean up after itself", function() {
						//dash.remove.database(this.context);
					});

				});
			});

		});

	});
}());

