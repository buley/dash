(function(){
	'use strict';
	describe("get.databases", function() {
		var start_time = new Date().getTime(),
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			ctx,
			db_name = 'get-databases-db-' + new Date().getTime();
		it( 'should get all databases, when available', function() {
			//TODO: DB's not always available on init
			dash.get.databases({database: db_name})
				(function(context) {
					ctx = context;
					isFinished = true;
					done();
					success = true;
				}, function(context) {
					ctx = context;
					error = true;
					isFinished = true;
					done();
				}, function(context) {
					notify = true;
				});
			it('the get.databases operation to finish', function() {
				describe('get.databases should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.available = undefined !== window.indexedDB.webkitGetDatabaseNames;
					});
					it("should be a success when available", function() {
						if (this.available) {
							expect(this.success).toBe(true);
							expect(this.error).toBe(false);
							expect(this.notify).toBe(false);
						}
					});
					it("should return a Array when available", function() {
						if (this.available) {
							expect(this.context.databases instanceof Array || null === this.context.databases).toBe(true);
						}
					});
					it("should be an error when unavailable", function() {
						if (!this.available) {
							expect(this.success).toBe(false);
							expect(this.error).toBe(true);
							expect(this.notify).toBe(false);
						}
					});				
					it("should not have database when unavailable", function() {
						if (!this.available) {
							expect(this.context.databases).toBeUndefined();
						}
					});
				});
			});
		});
	});
}());
