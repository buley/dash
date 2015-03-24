(function(){
	'use strict';
	describe("get.index", function() {
		var start_time = new Date().getTime(),
			db_name = 'idx-get-test-' + start_time,
			store_name = 'idx-get-test-store-' + start_time,
			index_name = 'idx-get-test-' + start_time,
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
            dash.get.index({ database: db_name, store: store_name, index: index_name, index_key_path: key_path })
            (function(context) {
                dash.get.index(context)
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
            }, function(context) {
                ctx = context;
                error = true;
                isFinished = true;
                done();
            }, function(context) {
                notify = true;
            });


			it('the get.index operation to finish', function() {
				describe('get.index should finish cleanly', function() {

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
					
					it("get.index should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("get.index should have the correct parent/child relationships", function() {
						expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
						expect(-1 !== this.context.objectstore.indexNames.indexOf(this.context.index)).toBe(true);
					});

					it("get.index references should be the db, store and index we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
						expect(this.context.idx.name).toBe(this.indexname);
					});

					it("get.index idx should have correct properties", function(){
						expect(this.context.idx.multiEntry).toBe(false);
						expect(this.context.idx.unique).toBe(false);
						expect(this.context.idx.keyPath).toBe(this.keypath);
					});

					it("get.index should clean up after itself", function() {
						dash.remove.database(this.context);
					});

				});
			});

		});
	});
}());

