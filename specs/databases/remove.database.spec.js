(function(){
	'use strict';
	describe("remove.database", function() {
		var start_time = new Date().getTime(),
			db_name = 'db-remove-test-' + start_time,
			error = false,
			seconderror = false,
			secondsuccess = false,
			secondnotify = false,
			success = false,
			notify = false,
			prectx,
			ctx;	

		describe( 'should open and then remove', function() {
			beforeEach(function(done){
				dash.get.database({ database: db_name, store: db_name })
					(function(context) {
						prectx = context;
						dash.remove.database(context)
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
					}, function(context) {
						prectx = context;
						error = true;
					}, function(context) {
						notify = true;
					});
			});

			describe('database.remove should finish cleanly', function() {
				beforeEach(function(done) {
					this.context = ctx;
					this.setup = prectx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					done();
				});
				it("should be a success", function() {
					expect(this.error).toBe(false);
					expect(this.success).toBe(true);
					expect(this.notify).toBe(false);
					expect(this.context.error).toBeUndefined();
				});
			});

		});
	});
}());

