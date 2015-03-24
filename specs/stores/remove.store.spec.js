(function(){
	'use strict';
	describe("remove.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-remove-test-' + start_time,
			store_name = 'store-remove-test-store-' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			seconderror = false,
			secondsuccess = false,
			secondnotify = false,
			success = false,
			notify = false,
			addcount,
			startcount,
			finalcount,
			ctx;	
		it( 'should open a database then add and then get a store', function() {
            startcount = 0;
            dash.get.store({ database: db_name, store: store_name })
            (function(context){
                addcount = context.db.objectStoreNames.length;
                dash.remove.store(context)
                (function(context) {
                    ctx = context;
                    finalcount = context.db.objectStoreNames.length;
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
            }, function(context) {
                ctx = context;
                error = true;
                isFinished = true;
                done();
            }, function(context) {
                notify = true;
		    });


			it('the remove.store operation to finish', function() {
				describe('remove.store should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
						this.addcount = addcount;
						this.startcount = startcount;
						this.finalcount = finalcount;
					});
					
					it("remove.store should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});

					it("remove.store should return fewer stores than before the delete", function() {
						expect(this.addcount).toBe(this.startcount + 1);
						expect(this.finalcount).toBe(this.startcount);
					});
					it("remove.store should have the correct parent/child relationship", function() {
						expect(-1 === this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					});

					it("remove.store references should be the db and store we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
					});

					it("remove.store should clean up after itself", function() {
						dash.remove.database(this.context);
					});

				});
			});

		});
	});
}());

