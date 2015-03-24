(function(){
	'use strict';
	describe("add.index", function() {
		it( 'should open a database, add a store and an index to it with default parameters', function() {
			var start_time = new Date().getTime(),
				db_name = 'idx-add-test-' + start_time,
				store_name = 'idx-add-test-store-' + start_time,
				index_name = 'idx-add-text' + start_time,
				key_path = 'idx' + start_time,
				isFinished = false,
				dashIsFinished = function() { 
					return isFinished;
				},
				error = false,
				success = false,
				notify = false,
				ctx;		
            dash.get.index({ database: db_name, store: store_name, index: index_name, index_key_path: key_path })
            (function(context) {
                success = true;
                isFinished = true;
                ctx = context;
                done();
            }, function(context) {
                ctx = context;
                error = true;
                isFinished = true;
                done();
            }, function(context) {
                notify = true;
            });

			it('the add.index operation to finish', function() {
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
	
					it("add.index should have the correct parent/child relationships", function() {
						expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
						expect(-1 !== this.context.objectstore.indexNames.indexOf(this.context.index)).toBe(true);
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
						dash.remove.database(this.context)
					});

				});
			});

		});

		it( 'index creation should support index unique and multientry configuration parameters', function() {
			var start_time = new Date().getTime(),
				db_name = 'idx-add-test2-' + start_time,
				store_name = 'idx-add-test2-store-' + start_time,
				index_name = 'idx-add-text2' + start_time,
				key_path = 'idx' + start_time,
				index_unique = true,
				index_multientry = true,
				isFinished = false,
				dashIsFinished = function() { 
					return isFinished;
				},
				error = false,
				success = false,
				notify = false,
				ctx;		

            dash.get.index({
					database: db_name,
					store: store_name,
					index: index_name,
					index_key_path: key_path,
					index_multi_entry: index_multientry,
					index_unique: index_unique
				})
				(function(context) {
					success = true;
					isFinished = true;
					done();
					ctx = context;
				}, function(context) {
					ctx = context;
					error = true;
					isFinished = true;
					done();
				}, function(context) {
					notify = true;
				});

			it('the add.index operation to finish', function() {
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
						this.unique = index_unique;
						this.multientry = index_multientry;
					});

					it("add.index idx should have correct multientry config option", function(){
						expect(this.context.idx.multiEntry).toBe(this.multientry);
					});
					it("add.index idx should have correct uniqueness config option", function(){
						expect(this.context.idx.unique).toBe(this.unique);
					});

					it("add.index should clean up after itself", function() {
						dash.remove.database(this.context);
					});

				});
			});

		});

	});
}());
