(function(){
	'use strict';
	describe("add.store", function() {
		describe( 'should open a database then add a store', function() {
			var error = false,
                success = false,
                notify = false,
                ctx,
                start_time = new Date().getTime(),
                db_name = 'store-add-test-' + start_time,
                store_name = 'store-add-test-store-' + start_time;

			beforeEach(function(done) {
				dash.get.store({ database: db_name, store: store_name })
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


			describe('add.store should finish cleanly', function() {
				beforeEach(function() {
					this.context = ctx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					this.storename = store_name;
				});
				
				it("add.store should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					expect(this.context.db.name).toBe(this.dbname);
					expect(this.context.objectstore.name).toBe(this.storename);
					expect(this.context.objectstore.keyPath).toBe(null);
					expect(this.context.objectstore.autoIncrement).toBe(false);
				});

			});

		});


		it( 'should open a database then add a store', function() {
			var error = false,
				success = false,
				notify = false,
				ctx,
				start_time = new Date().getTime(),
				db_name = 'store-add-test2-' + start_time,
				store_name = 'store-add-test2-store-' + start_time,
				store_key_path = 'storeAddTest2Store' + start_time,
				store_auto_increment = true;

			beforeEach(function(done) {
	            dash.get.store({
	                database: db_name,
	                store: store_name,
	                store_key_path: store_key_path,
	                auto_increment: store_auto_increment
	            })
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


			describe('add.store should finish cleanly', function() {
				beforeEach(function(done) {
					this.context = ctx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					this.storename = store_name;
					this.store_key_path = store_key_path;
					this.autoincrement = store_auto_increment;
					done();
				});

				it("add.store objectstore should use the provided autoincrement setting", function(){
					expect(this.context.objectstore.autoIncrement).toBe(this.autoincrement);
				});

			});

		});


	});
}());

