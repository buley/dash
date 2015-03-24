(function(){
	'use strict';
	xdescribe("remove.database", function() {
		var start_time = new Date().getTime(),
			db_name = 'db-remove-test-' + start_time,
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
			dash.get.database({ database: db_name, store: db_name })
				(function(context) {
					prectx = context;
					dash.remove.database(context)
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
				}, function(context) {
					prectx = context;
					error = true;
				}, function(context) {
					notify = true;
				});

			it('the remove.database operation to finish', function() {
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
						//TODO: Figure out "The request has not finished" in Chrome
						//expect(this.error).toBe(false);
						//expect(this.success).toBe(true);
						expect(this.notify).toBe(false);
						expect(this.context.error).toBeUndefined();
					});
				});
			});
		});
	});
}());

