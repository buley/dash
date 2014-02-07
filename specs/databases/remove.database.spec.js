(function(){
	'use strict';
	describe("remove.database", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-remove-test-' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			seconderror = false,
			secondsuccess = false,
			secondnotify = false,
			success = false,
			notify = false,
			prectx,
			ctx;	
		it( 'should open and then remove', function() {
			dash.open.database({ database: db_name, store: db_name })
				.then(function(context) {
					prectx = context;
				}, function(context) {
					prectx = context;
					error = true;
				})
				.then(dash.remove.database)
				.then(function(context) {
					ctx = context;
					success = true;
					isFinished = true;
				}, function(context) {
					ctx = context;
					error = true;
					isFinished = true;
				}, function(context) {
					notify = true;
				});

			waitsFor(dashIsFinished, 'the remove.database operation to finish', 10000);
			runs(function() {
				describe('database.remove should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.setup = prectx;
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
					/* datanse removal test === no cleanup */
				});
			});
		});
	});
}());

