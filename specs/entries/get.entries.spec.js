
(function(){
    'use strict';
    fdescribe("get.entries", function() {
        var start_time = new Date().getTime(),
            db_name = 'entries-get-test-' + start_time,
            store_name = 'entries-get-test-store-' + start_time,
            index_name = 'entries-get-test-index-' + start_time,
            key_path = 'entries' + start_time,
            index_key_path = 'entriesIndex' + start_time,
            test_data = { version: 1 },
            error = false,
            success = false,
            notify = false,
            ctx,
            index_key_path_value = 'entries-get-index-value-' + start_time,
            key_path_value = 'entries-get-value-' + start_time;
        
        test_data[key_path] = key_path_value;
        test_data[index_key_path] = index_key_path_value;
        beforeEach(function(done) {
            dash.add.entry({
                database: db_name,
                store: store_name,
                store_key_path: key_path,
                index_key_path: index_key_path,
                index: index_name,
                data: test_data
            })
            (function(context) {
                dash.get.entries(context)
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
                error = true;
                done();
            });
        });


        describe('get.entries should finish cleanly', function() {

                beforeEach(function(done) {
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
                    done();
                });

                it("get.entries should have sent a success notify", function() {
                    expect(this.notify).toBe(true);
                    expect(this.error).toBe(false);
                    expect(this.context.error).toBeUndefined();
                    expect(this.success).toBe(true);
                    console.log(this.context.db.objectStoreNames);
                    expect(this.context.db.name).toBe(this.dbname);
                    expect(this.context.objectstore.name).toBe(this.storename);
                    expect(this.context.idx.name).toBe(this.indexname);
                });

        });

    });
}());

