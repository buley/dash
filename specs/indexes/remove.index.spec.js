
(function(){
	'use strict';
	describe("get.index", function() {
		var start_time = new Date().getTime(),
			db_name = 'idx-remove-test-db-' + start_time,
			store_name = 'idx-remove-test-store-' + start_time,
			index_name = 'idx-remove-test-idx-' + start_time,
			key_path = 'idx' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			addcount = Infinity,
			finalcount,
			startcount,
			ctx;	

		describe( 'should open a database, add a store and an index to it', function() {
			beforeEach(function(done) {
	            dash.get.index({ database: db_name, store: store_name, index: index_name, index_key_path: key_path})
	                (function(context) {
	                    addcount = context.objectstore.indexNames.length;
	                    dash.remove.index(context)
	                    (function(context) {
	                        success = true;
	                        finalcount = context.objectstore.indexNames.length;
	                        ctx = context;
	                        done();
	                    }, function(context) {
	                        ctx = context;
	                        error = true;
	                        done();
	                    }, function(context) {
	                        notify = true;
	                    });
	                }, function(context) {
	                    ctx = context;
	                    error = true;
	                    done();
	                }, function(context) {
	                    notify = true;
	                });
			});

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
					this.addcount = addcount;
					this.finalcount = finalcount;
					this.startcount = startcount;
				});

				it("get.index should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(this.addcount > 0).toBe(true);
					expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					expect(-1 !== this.context.objectstore.indexNames.indexOf(this.context.index)).toBe(false);
					expect(this.context.db.name).toBe(this.dbname);
					expect(this.context.objectstore.name).toBe(this.storename);
				});

			});

		});
	});
}());

