(function(){
	'use strict';
	describe("get.stores", function() {
		var start_time = new Date().getTime(),
			db_name = 'stores-get-test-' + start_time,
			store_name = 'stores-get-test-store-' + start_time,
			error = false,
			success = false,
			notify = false,
			ctx;
        beforeEach(function(done) {
			dash.get.stores({ database: db_name, store: store_name })
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
		describe( 'should get all stores, when available', function() {
			beforeEach(function(done) {
				this.context = ctx;
				this.success = success;
				this.error = error;
				this.notify = notify;
				done();
			});
			it("get.stores should be a finish cleanly", function() {
				expect(this.success).toBe(true);
				expect(this.error).toBe(false);
				expect(this.notify).toBe(false);
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
		});
	});
}());
