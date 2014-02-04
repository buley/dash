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
			ctx;	
		it( 'should get all databases, when available', function() {
			dash.get.databases()
				.then(dash.open.databases)
				.then(function(context) {
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
			waitsFor(dashIsFinished, 'the open.databases operation to finish', 3000);
			runs(function() {
				describe('open.databases should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
					});
					it("should be a success when available", function() {
						if (undefined !== window.indexedDB.webkitGetDatabaseNames) {
							expect(this.success).toBe(true);
							expect(this.error).toBe(false);
							expect(this.notify).toBe(false);
							expect(this.context.databases instanceof DOMStringList).toBe(true);
						}
					});
					it("should be an error when unavailable", function() {
						if (undefined === window.indexedDB.webkitGetDatabaseNames) {
							expect(this.success).toBe(false);
							expect(this.error).toBe(true);
							expect(this.notify).toBe(false);
							expect(this.context.databases).toBeUndefined();
						}
					});
				});
				runs(function(){
					//No cleanup
				});
			});
		});
	});
}());