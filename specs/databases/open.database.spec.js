(function(){
	'use strict';
	
	/* Shared expectations across open of new and existing database */

	var beSuccess = function(that) {
		expect(that.notify).toBe(false);
		expect(that.error).toBe(false);
		expect(that.context.error).toBeUndefined();
		expect(that.success).toBe(true);
	};
	
	var haveReferences = function(that) {
		expect(that.context.db instanceof IDBDatabase).toBe(true);
		expect(that.context.request instanceof IDBOpenDBRequest).toBe(true);
	};
	
	var haveNameAndVersion = function(that, dbname) {
		expect(that.dbname).toBe(that.context.database);
		expect(that.context.db.name).toBe(that.context.database);
		expect(that.context.db.version).toBe(1);
	};

	describe("open.database", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-open-test-' + start_time,
			store_name = 'store-open-test-' + start_time,
			isClosed = false,
			dashDbIsClosed = function() {
				return isClosed;
			}
		it ('should handle both existing and new databases', function() {
			/* Test for database creation when opening store that doesn't yet exist */
			runs(function(){
				describe( 'new database example', function(){
					var isFinished = false,
						dashIsFinished = function() { 
							return isFinished;
						},
						error = false,
						success = false,
						notify = false,
						ctx;	
					it( 'should open a new database when none exists', function() {
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
						waitsFor(dashIsFinished, 'the open.database operation to finish', 3000);
						runs(function() {
							describe('the open.database operation should finish cleanly', function() {
								beforeEach(function() {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.dbname = db_name;
								});
								it("the open.database operation should be a success", function() {
									beSuccess(this);
								});
								it("the open.database operation should have references to the database and opening request", function() {
									haveReferences(this);
								});
								it('the open.database operation should have the correct attributes', function() {
									haveNameAndVersion(this);
								});
								it('the open.database operation should be an upgrade', function() {
									expect(this.context.upgrade).toBe(true);
								});
								it('the open.database operation cleanup after itself',function(){
									//dash.close.database(this.context);
								});
							});
						});
					});
				});
			});

			/* Test for opening an existing database: should handle
			 * in the same way, execept with upgrade flags as false */
			runs(function(){
				describe( 'existing database example', function(){
					var isFinished = false,
						dashIsFinished = function() { 
							return isFinished;
						},
						error = false,
						success = false,
						notify = false,
						ctx;
					it( 'should open an existing database when one exists', function() {
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
						waitsFor(dashIsFinished, 'the open.database operation to finish', 10000);
						runs(function() {
							describe('secondary should finish cleanly', function() {
								beforeEach(function() {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.dbname = db_name;
								});
								it("secondary should be a success", function() {
									beSuccess(this);
								});
								it("secondary should have references to the database and opening request", function() {
									haveReferences(this);
								});
								it('secondary should have the correct attributes', function() {
									haveNameAndVersion(this);
								});
								it('secondary should not be an upgrade', function() {
									expect(this.context.upgrade).toBe(false);
								});
								it("open.database secondary test should clenup after itself", function(){
									dash.close.database(this.context)
									//.then(dash.remove.database);
								});
							});
						});
					});
				});
			});
		});
	});
}());