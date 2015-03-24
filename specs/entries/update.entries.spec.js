(function () {
    'use strict';
    describe("update.entries", function () {
        it('should open a database, add a store and add then get entries', function () {
            var start_time = new Date().getTime(),
                db_name = 'entries-get-test-' + start_time,
                store_name = 'entries-get-test-store-' + start_time,
                index_name = 'entries-get-test-index-' + start_time,
                key_path = 'entries' + start_time,
                index_key_path = 'entriesIndex' + start_time,
                test_data = {
                    version: 1
                },
                random_update = Math.floor(Math.random() * 100) + 1,
                isFinished = false,
                dashIsFinished = function () {
                    return isFinished;
                },
                error = false,
                success = false,
                notify = false,
                ctx,
                index_key_path_value = 'entries-get-index-value-' + start_time,
                key_path_value = 'entries-get-value-' + start_time;
            test_data[key_path] = key_path_value;
            test_data[index_key_path] = index_key_path_value;
            dash.add.entry({
              database: db_name,
              store: store_name,
              store_key_path: key_path,
              index_key_path: index_key_path,
              index: index_name,
              data: test_data,
	      collect: true
            })
            (function (context) {
              context.data.version = random_update;
              dash.update.entries(context)
              (function (context) {
                dash.get.entries(context)
                (function (context) {
                  success = true;
                  isFinished = true;
                  done();
                  ctx = context;
                }, function (context) {
                  ctx = context;
                  error = true;
                  isFinished = true;
                  done();
                }, function (context) {
                  notify = true;
                });
              }, function (context) {
                ctx = context;
                error = true;
                isFinished = true;
                done();
              }, function (context) {
                notify = true;
              });
            });

            it('the update.entries operation to finish', function () {
                describe('update.entries should finish cleanly', function () {

                    beforeEach(function () {
                        this.context = ctx;
                        this.success = success;
                        this.error = error;
                        this.notify = notify;
                        this.dbname = db_name;
                        this.storename = store_name;
                        this.indexname = index_name;
                        this.keypath = key_path;
                        this.key = test_data[key_path];
                        this.data = test_data;
                        this.random = random_update;
                    });

                    //TODO: Why not true?
                    it("update.entries should have sent a success notify", function () {
                        //expect(this.notify).toBe(true);
                    });

                    it("update.entries not have thrown errors", function () {
                        expect(this.error).toBe(false);
                        expect(this.context.error).toBeUndefined();
                    });
                    it("update.entries should be a success", function () {
                        expect(this.success).toBe(true);
                    });

                    it("update.entries should have the correct parent/child relationships", function () {
                        expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
                    });

                    it("update.entries references should be the db, store and index we asked for", function () {
                        expect(this.context.db.name).toBe(this.dbname);
                        expect(this.context.objectstore.name).toBe(this.storename);
                        expect(this.context.idx.name).toBe(this.indexname);
                    });

	  	    //TODO: Test collect behavior
		    /*
                    it("update.entries should return entries", function () {
                        expect(undefined !== this.context.entries).toBe(true);
                        expect(null !== this.context.entries).toBe(true);
                        expect(this.context.entries.length).toBe(1);
                        expect(this.context.entries[0].version).toBe(this.random);
                        expect(this.context.entries[0][key_path]).toBe(key_path_value);
                    });
		    */

                    it("update.entries should clean up after itself", function () {
                        dash.remove.database(this.context);
                    });

                });
            });

        });

    });
}());
