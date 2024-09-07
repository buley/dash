(function(){
	'use strict';
	describe("get.index", function() {
		var start_time = new Date().getTime(),
			db_name = 'idx-get-test-' + start_time,
			store_name = 'idx-get-test-store-' + start_time,
			index_name = 'idx-get-test-' + start_time,
			key_path = 'idx' + start_time,
			error = false,
			success = false,
			notify = false,
			ctx;


    	beforeEach(function(done) {
            dash.get.index({ database: db_name, store: store_name, index: index_name, index_key_path: key_path })
            (function(context) {
                dash.get.index(context)
                (function(context) {
                    success = true;
                    ctx = context;
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
    	
        describe( 'should open a database, add a store and an index to it', function() {

			beforeEach(function(done) {
				this.context = ctx;
				this.success = success;
				this.error = error;
				this.notify = notify;
				this.dbname = db_name;
				this.storename = store_name;
				this.indexname = index_name;
				this.keypath = key_path;
				done();
			});
			
			it("get.index should be a success", function() {
				expect(this.notify).toBe(false);
				expect(this.error).toBe(false);
				expect(this.context.error).toBeUndefined();
				expect(this.success).toBe(true);
				expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
				expect(-1 !== this.context.objectstore.indexNames.indexOf(this.context.index)).toBe(true);
				expect(this.context.db.name).toBe(this.dbname);
				expect(this.context.objectstore.name).toBe(this.storename);
				expect(this.context.idx.name).toBe(this.indexname);
				expect(this.context.idx.multiEntry).toBe(false);
				expect(this.context.idx.unique).toBe(false);
				expect(this.context.idx.keyPath).toBe(this.keypath);
				dash.remove.database(this.context);
			});

		});
	});
}());

