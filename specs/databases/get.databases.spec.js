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
			//TODO: DB's not always available on init
			setTimeout(function() {
				dash.get.databases()
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
			},1000);
			waitsFor(dashIsFinished, 'the get.databases operation to finish', 10000);
			runs(function() {
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
					it("should return a DOMStringList when available", function() {
						if (this.available) {
							expect(this.context.databases instanceof DOMStringList || null === this.context.databases).toBe(true);
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