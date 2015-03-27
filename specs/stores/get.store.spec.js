(function(){
	'use strict';
	describe("get.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-get-test-' + start_time,
			store_name = 'store-get-test-store-' + start_time,
			store_key_path = 'storeGetTestKeyPath' + start_time,
			error = false,
			success = false,
			notify = false,
			prectx,
			ctx;	
		describe( 'should open a database then add and then get a store', function() {

			beforeEach(function(done) {
	            dash.get.store({ database: db_name, store: store_name, store_key_path: store_key_path })
	            (function(context) {
	                ctx = context;
	                success = true;
	                done();
	            }, function(context) {
	                ctx = context;
	                error = true;
	                done();
	            }, function(context) {
	                notify = true;
	            });
			});

			describe('get.store should finish cleanly', function() {

				beforeEach(function(done) {
					this.context = ctx;
					this.setup = prectx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					this.storename = store_name;
					done();
				});
				
				it("get.store should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(-1 === this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(false);
					expect(this.context.db.name).toBe(this.dbname);
					expect(this.context.objectstore.name).toBe(this.storename);
				});

			});

		});
	});
}());

