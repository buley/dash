(function(){
	'use strict';
	describe("add.store", function() {
		it( 'should open a database then add a store', function() {
			var isFinished = false,
                dashIsFinished = function() {
                    return isFinished;
                },
                error = false,
                success = false,
                notify = false,
                ctx,
                start_time = new Date().getTime(),
                db_name = 'store-add-test-' + start_time,
                store_name = 'store-add-test-store-' + start_time;


            dash.get.store({ database: db_name, store: store_name })
            (function(context) {
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

			it('the add.store operation to finish', function() {
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
					});
					
					it("add.store should have the correct parent/child relationship", function() {
						expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					});

					it("add.store references should be the db and store we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
					});

					it("add.store objectstore should have default properties", function(){
						expect(this.context.objectstore.keyPath).toBe(null);
						expect(this.context.objectstore.autoIncrement).toBe(false);
					});

					it("add.store should clean up after itself", function() {
						dash.remove.database(this.context);
					});

				});
			});

		});


		it( 'should open a database then add a store', function() {
			var isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			ctx,
			start_time = new Date().getTime(),
			db_name = 'store-add-test2-' + start_time,
			store_name = 'store-add-test2-store-' + start_time,
			store_key_path = 'storeAddTest2Store' + start_time,
			store_auto_increment = true;
            dash.get.store({
                database: db_name,
                store: store_name,
                store_key_path: store_key_path,
                auto_increment: store_auto_increment
            })
            (function(context) {
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

			it('the add.store operation to finish', function() {
				describe('add.store should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
						this.store_key_path = store_key_path;
						this.autoincrement = store_auto_increment;
					});

					it("add.store objectstore should use the provided autoincrement setting", function(){
						expect(this.context.objectstore.autoIncrement).toBe(this.autoincrement);
					});

					it("add.store should clean up after itself", function() {
						dash.remove.database(this.context);
					});

				});
			});

		});


	});
}());

