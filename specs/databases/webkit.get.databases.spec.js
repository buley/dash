(function(){
	'use strict';
	describe("get.databases", function() {
		var start_time = new Date().getTime(),
			error = false,
			success = false,
			notify = false,
			ctx,
			db_name = 'get-databases-db-' + new Date().getTime();
		describe( 'should get all databases, when available', function() {
			beforeEach(function(done) {
				dash.get.databases()
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
			describe('get.databases should finish cleanly', function() {
				beforeEach(function(done) {
					this.context = ctx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.available = undefined !== window.indexedDB.webkitGetDatabaseNames;
					done();
				});
				it("should be a success when available", function() {
					if (this.available) {
						expect(this.success).toBe(true);
						expect(this.error).toBe(false);
						expect(this.notify).toBe(false);
					} else {
						expect(this.success).toBe(false);
						expect(this.error).toBe(true);
						expect(this.notify).toBe(false);
					}
				});
				it("should return a Array when available", function() {
					if (this.available) {
						expect(this.context.databases).not.toBeUndefined();
						expect(this.context.databases instanceof Array || null === this.context.databases).toBe(true);
					} else {
						expect(this.context.databases).toBeUndefined();
					}
				});
				it("should be an error when unavailable", function() {
					if (!this.available) {
						expect(this.success).toBe(false);
						expect(this.error).toBe(true);
						expect(this.notify).toBe(false);
					} else {
						expect(this.success).toBe(true);
						expect(this.error).toBe(false);
						expect(this.notify).toBe(false);
					}
				});
			});
		});
	});
}());
