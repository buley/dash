(function(){
	'use strict';
	describe("get.stores", function() {
		var start_time = new Date().getTime(),
			db_name = 'stores-get-test-' + start_time,
			store_name = 'stores-get-test-store-' + start_time,
			isFinished = false,
			error = false,
			success = false,
			notify = false,
			ctx;	
		it( 'should get all stores, when available', function() {
            dash.get.stores({ database: db_name, store: store_name })
                (function(context) {
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

			waitsFor(function() { 
				return isFinished;
			}, 'the get.stores operation to finish', 10000);

			runs(function() {
				describe('get.stores should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
					});
					it("get.stores should be a finish cleanly", function() {
						expect(this.success).toBe(true);
						expect(this.error).toBe(false);
						expect(this.notify).toBe(false);
					});
					it("get.stores return a DOMStringList with the right contents", function() {
						expect(this.context.stores instanceof DOMStringList).toBe(true);
						expect(this.context.stores.length).toBe(1);
						expect(this.context.stores.contains(this.context.store)).toBe(true);
					});
					it("get.stores should clean up after itself", function() {
						//dash.remove.database(this.context);
					});
				});
			});
		});
	});
}());