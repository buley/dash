(function(){
	'use strict';
	describe("get.indexes", function() {
		var start_time = new Date().getTime(),
			db_name = 'indexes-get-test-database-' + start_time,
			store_name = 'indexes-get-test-store-' + start_time,
			index_name = 'indexes-get-test-index-' + start_time,
			key_path = 'indexesGetTestKeyPath' + start_time,
			isFinished = false,
			error = false,
			success = false,
			notify = false,
			ctx;

		it( 'should get all indexes', function() {
            dash.get.indexes({ database: db_name, store: store_name, index: index_name, index_key_path: key_path})
            (function(context){
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

			it('the get.indexes operation to finish', function() {
				describe('get.indexes should finish successfully', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
					});
					it("get.indexes should be a finish cleanly", function() {
						expect(this.success).toBe(true);
						expect(this.error).toBe(false);
						expect(this.notify).toBe(false);
					});
					it("get.indexes return an array with the right contents", function() {
						expect(this.context.indexes instanceof Array).toBe(true);
						expect(this.context.indexes.length).toBe(1);
                                                var found = false, x = 0, xlen = this.context.indexes.length;
                                                for ( x = 0; x < xlen; x += 1 ) {
                                                        if ( this.context.index === this.context.indexes[x] ) {
                                                                found = true;
                                                        }
                                                }
                                                expect(found).toBe(true);
					});
					it("get.indexes should clean up after itself", function() {
						dash.remove.database(this.context);
					});
				});
			});
		});
	});
}());
