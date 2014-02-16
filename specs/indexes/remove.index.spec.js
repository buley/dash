
(function(){
	'use strict';
	ddescribe("get.index", function() {
		var start_time = new Date().getTime(),
			db_name = 'idx-remove-test-db-' + start_time,
			store_name = 'idx-remove-test-store-' + start_time,
			index_name = 'idx-remove-test-idx-' + start_time,
			key_path = 'idx' + start_time,
			isFinished = false,
			dashIsFinished = function() { 
				return isFinished;
			},
			error = false,
			success = false,
			notify = false,
			addcount = Infinity,
			finalcount,
			startcount,
			ctx;	
		it( 'should open a database, add a store and an index to it', function() {
            dash.add.store({ database: db_name, store: store_name, index: index_name, index_key_path: key_path})
            .then(function(context) {
                startcount = context.objectstore.indexNames.length;
                dash.add.index(context)
                .then(function(context) {
                    addcount = context.objectstore.indexNames.length;
                    dash.remove.index(context)
                    .then(function(context) {
                        success = true;
                        finalcount = context.objectstore.indexNames.length;
                        isFinished = true;
                        ctx = context;
                    }, function(context) {
                        ctx = context;
                        error = true;
                        isFinished = true;
                    }, function(context) {
                        notify = true;
                    });
                }, function(context) {
                    ctx = context;
                    error = true;
                    isFinished = true;
                }, function(context) {
                    notify = true;
                });
            }, function(context) {
                ctx = context;
                error = true;
                isFinished = true;
            }, function(context) {
                notify = true;
            });

			waitsFor(dashIsFinished, 'the get.index operation to finish', 10000);
			runs(function() {
				ddescribe('get.index should finish cleanly', function() {
					beforeEach(function() {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
						this.indexname = index_name;
						this.keypath = key_path;
						this.addcount = addcount;
						this.finalcount = finalcount;
						this.startcount = startcount;
					});
					it("get.index should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
					});
					it("get.index should have the correct references", function() {
						expect(this.context.db instanceof IDBDatabase).toBe(true);
						expect(this.context.objectstore instanceof IDBObjectStore).toBe(true);
						expect(this.context.idx instanceof IDBIndex).toBe(true);
					});
					it("get.index should return fewer indexes than before the delete", function() {
						expect(this.finalcount).toBe(this.startcount);
						expect(this.finalcount < this.addcount).toBe(true);
					});
					it("get.index should have the correct parent/child relationships", function() {
						expect(this.context.db.objectStoreNames.contains(this.context.store)).toBe(true);
						expect(this.context.objectstore.indexNames.contains(this.context.index)).toBe(false);
					});
					it("get.index references should be the db, store and index we asked for", function(){
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
						expect(this.context.idx.name).toBe(this.indexname);
					});
					it("get.index idx should have correct properties", function(){
						expect(this.context.idx.multiEntry).toBe(false);
						expect(this.context.idx.unique).toBe(false);
						expect(this.context.idx.keyPath).toBe(this.keypath);
					});
					it("get.index should clean up after itself", function() {
						//dash.remove.database(this.context);
					});
				});
			});

		});
	});
}());

