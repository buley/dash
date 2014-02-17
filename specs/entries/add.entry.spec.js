
(function(){
	'use strict';
	ddescribe("add.entry", function() {
		it( 'should open a database, add a store and an index to it with default parameters', function() {
			var start_time = new Date().getTime(),
				db_name = 'entry-add-test-' + start_time,
				store_name = 'entry-add-test-store-' + start_time,
				key_path = 'entry' + start_time,
				test_data = { test: 'entry-add' },
				isFinished = false,
				dashIsFinished = function() { 
					return isFinished;
				},
				error = false,
				success = false,
				notify = false,
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
                console.log('added entry', context);
                success = true;
            }, function(context) {
                ctx = context;
                isFinished = false;
                error = true;
            });

			waitsFor(dashIsFinished, 'the add.entry operation to finish', 10000);
			runs(function() {
				ddescribe('add.entry should complete', function() {
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
						console.log('checking against',this.context);
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

