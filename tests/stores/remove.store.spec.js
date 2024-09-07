(function(){
	'use strict';
	describe("remove.store", function() {
		var start_time = new Date().getTime(),
			db_name = 'store-remove-test-' + start_time,
			store_name = 'store-remove-test-store-' + start_time,
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
		describe( 'should open a database then add and then get a store', function() {
            startcount = 0;

            beforeEach(function(done){
	            dash.get.store({ database: db_name, store: store_name })
	            (function(context){
	                addcount = context.db.objectStoreNames.length;
	                dash.remove.store(context)
	                (function(context) {
	                    ctx = context;
	                    finalcount = context.db.objectStoreNames.length;
	                    success = true;
	                    done();
	                }, function(context) {
	                    ctx = context;
	                    error = true;
		                done();
	                }, function(context) {
	                    notify = true;
	                });
	            }, function(context) {
	                ctx = context;
	                error = true;
	                done();
	            }, function(context) {
	                notify = true;
			    });
            });

			describe('remove.store should finish cleanly', function() {
				beforeEach(function(done) {
					this.context = ctx;
					this.success = success;
					this.error = error;
					this.notify = notify;
					this.dbname = db_name;
					this.storename = store_name;
					this.addcount = addcount;
					this.startcount = startcount;
					this.finalcount = finalcount;
					done();
				});
				
				it("remove.store should be a success", function() {
					expect(this.notify).toBe(false);
					expect(this.error).toBe(false);
					expect(this.context.error).toBeUndefined();
					expect(this.success).toBe(true);
					expect(this.addcount).toBe(this.startcount + 1);
					expect(this.finalcount).toBe(this.startcount);
					expect(-1 === this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
					expect(this.context.db.name).toBe(this.dbname);
				});

			});

		});
	});
}());

