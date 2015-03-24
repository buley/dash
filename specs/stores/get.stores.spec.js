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
                    done();
                }, function(context) {
                    ctx = context;
                    error = true;
                    isFinished = true;
                    done();
                }, function(context) {
                    notify = true;
                });

			it('the get.stores operation to finish', function() {
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
					it("get.stores return an Array with the right contents", function() {
						expect(this.context.stores instanceof Array).toBe(true);
						expect(this.context.stores.length).toBe(1);
                                                var found = false, x = 0, xlen = this.context.stores.length;
						for ( x = 0; x < xlen; x += 1 ) {
							if ( this.context.store === this.context.stores[x] ) {
								found = true;
							}
						}
						expect(found).toBe(true);
					});
					it("get.stores should clean up after itself", function() {
						dash.remove.database(this.context);
					});
				});
			});
		});
	});
}());
