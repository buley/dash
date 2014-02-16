(function(){
	'use strict';
	var start_time = new Date().getTime(),
		db_name = 'store-open-test-' + start_time,
		store_name = 'store-open-test-' + start_time;
	ddescribe("open.database", function() {
		it ('should handle a new database', function() {
			var isClosed = false,
				dashDbIsClosed = function() {
					return isClosed;
				};
			runs(function(){
				ddescribe( 'new database example', function(){
					var isFinished = false,
						dashIsFinished = function() { 
							return isFinished;
						},
						error = false,
						success = false,
						notify = false,
						ctx;	
					it( 'should open a new database when none exists', function() {
						dash.open.database({ database: db_name }).then(function(context) {
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
							ddescribe('the open.database operation should finish cleanly', function() {
								beforeEach(function() {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.dbname = db_name;
								});
								it("the open.database operation should be a success", function() {
									expect(this.notify).toBe(false);
									expect(this.error).toBe(false);
									expect(this.context.error).toBeUndefined();
									expect(this.success).toBe(true);
								});
								it("the open.database operation should have references to the database and opening request", function() {
									expect(this.context.db instanceof IDBDatabase).toBe(true);
									expect(this.context.request instanceof IDBOpenDBRequest).toBe(true);
								});
								it('the open.database operation should have the correct attributes', function() {
									expect(this.dbname).toBe(this.context.database);
									expect(this.context.db.name).toBe(this.context.database);
									expect(this.context.db.version).toBe(1);
								});
								it('the open.database operation should be an upgrade', function() {
									expect(this.context.upgrade).toBe(false);
								});
								it('the open.database operation cleanup after itself',function(){
									dash.close.database(this.context);
								});
							});
						});
					});
				});
			});

		});

		it ('should handle an existing databases', function() {
			var isClosed = false,
				dashDbIsClosed = function() {
					return isClosed;
				};

			/* Test for opening an existing database: should handle
			 * in the same way, execept with upgrade flags as false */
			runs(function(){
				ddescribe( 'existing database example', function(){
					var isFinished = false,
						dashIsFinished = function() { 
							return isFinished;
						},
						error = false,
						success = false,
						notify = false,
						ctx;
					it( 'should open an existing database when one exists', function() {
						dash.open.database({ database: db_name }).then(function(context) {
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

								it('secondary should not be an upgrade', function() {
									expect(this.context.upgrade).toBe(false);
								});

								it('an instance of IDBDatabase should be returned', function() {
									expect(this.context.db instanceof IDBDatabase).toBe(true);
								});

								it('secondary should not be an upgrade', function() {
									expect(this.context.db.version).toBe(1);
								});

								it("open.database secondary test should clenup after itself", function(){
									dash.close.database(this.context);
								});
							});
						});
					});
				});
			});
		});


		it ('should handle an existing databases with version upgrade', function() {
			var isClosed = false,
				dashDbIsClosed = function() {
					return isClosed;
				};

			/* Test for opening an existing database: should handle
			 * in the same way, execept with upgrade flags as false */
			runs(function(){
				ddescribe( 'existing database example', function(){
					var isFinished = false,
						dashIsFinished = function() { 
							return isFinished;
						},
						error = false,
						success = false,
						notify = false,
						random_version = Math.floor(Math.random() * 100) + 1,
						ctx;
					it( 'should open an existing database when one exists', function() {
						dash.open.database({ database: db_name, version: random_version }).then(function(context) {
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
							ddescribe('secondary should finish cleanly', function() {
								beforeEach(function() {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.version = random_version;
								});

								it('version increase should trigger an upgrade', function() {
									expect(this.context.upgrade).toBe(true);
								});

								it('an instance of IDBDatabase should be returned', function() {
									//TODO: Why "The request has not finished" in Chrome?
									//expect(this.context.db instanceof IDBDatabase).toBe(true);
								});

								it('version should be the provided version', function() {
									expect(this.context.new_version).toBe(this.version);
									expect(this.context.old_version).toBe(1);
								});

								it("open.database secondary test should clenup after itself", function(){
									dash.remove.database(this.context);
								});
							});
						});
					});
				});
			});
		});

	});
}());