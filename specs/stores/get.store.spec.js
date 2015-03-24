(function(){
	'use strict';
	describe("get.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-get-test-' + start_time,
			store_name = 'store-get-test-store-' + start_time,
			store_key_path = 'storeGetTestKeyPath' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			prectx,
			ctx;	
		it( 'should open a database then add and then get a store', function() {

            dash.get.store({ database: db_name, store: store_name, store_key_path: store_key_path })
            (function(context) {
                ctx = context;
                success = true;
                isFinished = true;
                done();
            }, function(context) {
                ctx = context;
                error = true;
                isFinished = true;
                done();
            }, function(context) {
                notify = true;
            });

			it('the get.store operation to finish', function() {
				describe('get.store should finish cleanly', function() {

					beforeEach(function() {
						this.context = ctx;
						this.setup = prectx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
					});
					
					it("get.store should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("get.store should have the correct parent/child relationship", function() {
						expect(-1 === this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(false);
					});

					it("get.store references should be the db and store we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});

					it("get.store should clean up after itself", function() {
						dash.remove.database(this.context);
					});

				});
			});

		});
	});
}());

