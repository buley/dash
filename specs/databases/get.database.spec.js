(function(){
	'use strict';
	var start_time = new Date().getTime(),
		db_name = 'database-get-test-' + start_time,
		store_name = 'database-get-test-' + start_time;
	describe("get.database", function() {
		it ('should handle a new database', function() {
			var isClosed = false,
				dashDbIsClosed = function() {
					return isClosed;
				};
			it(function(){
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
						dash.get.database({ database: db_name })(function(context) {
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
						waitsFor(dashIsFinished, 'the get.database operation to finish', 10000);
						runs(function() {
							describe('the get.database operation should finish cleanly', function() {
								beforeEach(function() {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.dbname = db_name;
								});
								it("the get.database operation should be a success", function() {
									expect(this.notify).toBe(false);
									expect(this.error).toBe(false);
									expect(this.context.error).toBeUndefined();
									expect(this.success).toBe(true);
								});
								it('the get.database operation should have the correct attributes', function() {
									expect(this.dbname).toBe(this.context.database);
									expect(this.context.db.name).toBe(this.context.database);
								});
								it('the get.database operation cleanup after itself',function(){
									//dash.close.database(this.context);
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
			it('should open an existing database', function(){
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
						dash.get.database({ database: db_name })(function(context) {
								ctx = context;
								isFinished = true;
								success = true;
								done();
							}, function(context) {
								ctx = context;
								error = true;
								isFinished = true;
								done();
							}, function(context) {
								notify = true;
							});
						waitsFor(dashIsFinished, 'the get.database operation to finish', 10000);
						runs(function() {
							describe('secondary should finish cleanly', function() {
								beforeEach(function() {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.dbname = db_name;
								});

								it("get.database secondary test should clenup after itself", function(){
									//dash.close.database(this.context);
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
			it('should handle an existing database with upgrades', function(){
				describe( 'existing database example', function(){
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
						dash.get.database({ database: db_name, version: random_version })(function(context) {
								ctx = context;
								isFinished = true;
								done();
								success = true;
							}, function(context) {
								ctx = context;
								error = true;
								isFinished = true;
								done();
							}, function(context) {
								notify = true;
							});
						if( 'the get.database operation to finish', function() {
							describe('teritary should finish cleanly', function() {
								beforeEach(function() {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.version = random_version;
								});

								it('version should be the provided version', function() {
									expect(this.context.new_version).toBe(this.version);
									expect(this.context.old_version).toBe(1);
								});

								it("get.database secondary test should clenup after itself", function(){
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