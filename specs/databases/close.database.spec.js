(function(){
	'use strict';
	xdescribe("close.database", function() {
		var start_time = new Date().getTime(),
			db_name = 'database-close-test-' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			ctx;	
		it( 'should open and then close', function() {
			dash.get.database({ database: db_name })
			(function(context) {
				ctx = context;
				isFinished = true;
				success = true;
			}, function(context) {
				ctx = context;
				error = true;
				isFinished = true;
			}, function(context) {
				notify = true;
			});
			waitsFor(dashIsFinished, 'the close.database operation to finish', 10000);
			runs(function() {
				describe('database.close should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
					});
					it("should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});
					it("should have the correct references", function() {
						expect(this.context.db instanceof IDBDatabase).toBe(true);
					});
					it( "database.close should clenup after itself", function(){
						dash.remove.database(this.context);
					});
				});
			});
		});
	});
}());
