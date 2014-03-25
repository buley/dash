//TODO: Better testing; add objects then clear them
(function(){
	'use strict';
	describe("clear.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-clear-test-' + start_time,
			store_name = 'store-clear-test-store-' + start_time,
			error = false,
			success = false,
			notify = false,
			ctx;	
		it( 'should open a database then add and then get a store', function() {

			beforeEach(function(done) {
				dash.clear.store({database: db_name, store: store_name})
					(function(context) {
						success = true;
						ctx = context;
						done();
					}, function(context) {
						ctx = context;
						error = true;
						done();
					}, function(context) {
						notify = true;
					});
			});


			describe('clear.store should finish cleanly', function() {
				beforeEach(function() {
					this.context = ctx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					this.storename = store_name;
				});
				
				it("clear.store should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					expect(this.context.db.name).toBe(this.dbname);
					expect(this.context.objectstore.name).toBe(this.storename);
				});
			});
		});
	});
}());

