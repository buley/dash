
(function(){
	'use strict';
	describe("get.database", function() {
		var start_time = new Date().getTime(),
			db_name = 'database-get-test-' + start_time,
			store_name = 'database-get-test-' + start_time;
		describe('should handle a new database', function() {
			var error = false,
				success = false,
				notify = false,
				ctx;
			describe( 'should open a new database when none exists', function() {
				beforeEach(function(done) {
					dash.get.database({ database: db_name })(function(context) {
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
				describe('the get.database operation should finish cleanly', function() {
					beforeEach(function(done) {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						done();
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
				});
			});
		});

		/* Test for opening an existing database: should handle
		 * in the same way, execept with upgrade flags as false */
		describe( 'existing database example', function(){
			var error = false,
				success = false,
				notify = false,
				ctx;
			describe( 'should open an existing database when one exists', function() {

				beforeEach(function(done) {
					dash.get.database({ database: db_name })(function(context) {
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

				describe('secondary should finish cleanly', function() {
					beforeEach(function(done) {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						done();
					});

					it("get.database secondary test should clenup after itself", function(){
						dash.close.database(this.context);
					});
				});
			});
		});

		describe('should handle an existing databases with version upgrade', function() {

			/* Test for opening an existing database: should handle
			 * in the same way, execept with upgrade flags as false */
			describe('should handle an existing database with upgrades', function(){
				describe( 'existing database example', function(){
					var error = false,
						success = false,
						notify = false,
						random_version = Math.floor(Math.random() * 100) + 1,
						ctx;

					describe( 'should open an existing database when one exists', function() {
						beforeEach(function(done) {
							dash.get.database({ database: db_name, version: random_version })(function(context) {
									ctx = context;
									done();
									success = true;
								}, function(context) {
									ctx = context;
									error = true;
									done();
								}, function(context) {
									notify = true;
								});
						});

						describe( 'the get.database operation to finish', function() {
							describe('teritary should finish cleanly', function() {
								beforeEach(function(done) {
									this.context = ctx;
									this.success = success;
									this.error = error;
									this.notify = notify;
									this.version = random_version;
									done();
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