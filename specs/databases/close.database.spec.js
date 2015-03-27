(function(){
	'use strict';
	describe("close.database", function() {
		var start_time = new Date().getTime(),
			db_name = 'database-close-test-' + start_time,
			error = false,
			success = false,
			notify = false,
			ctx;	
		describe( 'should open and then close', function() {
			beforeEach(function(done) {
				dash.get.database({ database: db_name })
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
			describe('the close.database operation to finish', function() {
				beforeEach(function(done) {
					this.context = ctx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					done();
				});
				it("should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(this.context.db).not.toBeFalsy();
					expect(this.context.db instanceof IDBDatabase).toBe(false);
					dash.remove.database(this.context);
				});
			});
		});
	});
}());
