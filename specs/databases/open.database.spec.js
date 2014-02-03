(function(){
	'use strict';
	describe("open.database", function() {
		var isFinished = false,
			isFinishedAgain = false,
			checkIfFinished = function() { 
				return isFinished;
			},
			checkIfFinishedAgain = function() { 
				return isFinishedAgain;
			},
			start_time = new Date().getTime(),
			db_name = 'store-open-test-' + start_time,
			error = false,
			success = false,
			notify = false,
			ctx;


		it( 'should open a database', function() {
			dash.open.database({ database: db_name })
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
			waitsFor(checkIfFinished, 'the open.database operation to finish', 3000);
			runs(function() {
				describe('should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.isFinishedAgain = false;
					});
					it('should not throw a notify', function() {
						expect(this.notify).toBe(false);
					});
					it('should not throw a error', function() {
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
					});
					it('should throw a success', function() {
						expect(this.success).toBe(true);
					});
					it("should have a context.db that's an instanceof IDBDatabase", function() {
						console.log(this.context,'instance?',this.context.db instanceof IDBDatabase);
						expect(this.context.db instanceof IDBDatabase).toBe(true);
					});
					it("should have a context.request that's an instanceof IDBOpenDBRequest", function() {
						expect(this.context.request instanceof IDBOpenDBRequest).toBe(true);
					});
					it("should have a context.transaction that's an instanceof IDBTransaction", function() {
						expect(this.context.transaction instanceof IDBTransaction).toBe(true);
					});
					it('should have the correct database name', function() {
						expect(this.context.db.name).toBe(db_name);
					});
					it('should be an upgrade', function() {
						expect(this.context.upgrade).toBe(true);
					});
					it('should have a version of 1', function() {
						expect(this.context.db.version).toBe(1);
						this.isFinishedAgain = true;
					});
				});
				runs(function(){
					console.log('cleanup',ctx);
					dash.close.database(ctx)
					.then(dash.remove.database);
				});
			});
		});

	});
}());