//TODO: Better testing; add objects then clear them
(function(){
	'use strict';
	describe("clear.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-clear-test-' + start_time,
			store_name = 'store-clear-test-store-' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			ctx;	
		it( 'should open a database then add and then get a store', function() {
			dash.clear.store({database: db_name, store: store_name})
				(function(context) {
					success = true;
					isFinished = true;
					ctx = context;
					done();
				}, function(context) {
					ctx = context;
					error = true;
					isFinished = true;
					done();
				}, function(context) {
					notify = true;
				});

			it('the clear.store operation to finish', function() {
				describe('clear.store should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
					});
					
					it("clear.store should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});
					
					it("clear.store should have the correct parent/child relationship", function() {
						expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					});

					it("clear.store references should be the db and store we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});

					it("clear.store should clean up after itself", function() {
						dash.remove.database(this.context);
					});
				});
			});
		});
	});
}());

