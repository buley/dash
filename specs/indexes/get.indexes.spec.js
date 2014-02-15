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
            dash.add.store({ database: db_name, store: store_name, index: index_name, index_key_path: key_path})
            .then(function(context) {
                dash.add.index(context)
                .then(function(context) {
                    dash.get.indexes(context)
                    .then(function(context){
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
                }, function(context) {
                    ctx = context;
                    error = true;
                    isFinished = true;
                }, function(context) {
                    notify = true;
                });
            });

			waitsFor(function() { 
				return isFinished;
			}, 'the get.indexes operation to finish', 10000);

			runs(function() {
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
					it("get.indexes return a DOMStringList with the right contents", function() {
						expect(this.context.indexes instanceof DOMStringList).toBe(true);
						expect(this.context.indexes.length).toBe(1);
						expect(this.context.indexes.contains(this.context.index)).toBe(true);
					});
					it("get.indexes should clean up after itself", function() {
						dash.remove.database(this.context);
					});
				});
			});
		});
	});
}());