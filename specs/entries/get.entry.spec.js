
(function(){
  'use strict';
  describe("get.entry", function() {
    it( 'should open a database, add a store and add then get an entry', function() {
      var start_time = new Date().getTime(),
        db_name = 'entry-get-test-' + start_time,
        store_name = 'entry-get-test-store-' + start_time,
        key_path = 'entry' + start_time,
        test_data = { version: 1 },
        isFinished = false,
        dashIsFinished = function() { 
          return isFinished;
        },
        error = false,
        success = false,
        notify = false,
        ctx,
        key_path_value = 'entry-get-value-' + start_time,
        add_key;
      test_data[key_path] = key_path_value;
      dash.add.entry({
        database: db_name,
        store: store_name,
        store_key_path: key_path,
        data: test_data
      })
      (function(context) {
        add_key = context.key;
        dash.get.entry(context)
        (function(context) {
          success = true;
          isFinished = true;
          ctx = context;
        }, function(context) {
          ctx = context;
          error = true;
          isFinished = true;
        }, function(context) {
          notify = true;
        });
      });

      waitsFor(dashIsFinished, 'the get.entry operation to finish', 10000);
      runs(function() {
        describe('get.entry should finish cleanly', function() {

          beforeEach(function() {
            this.context = ctx;
            this.success = success;
            this.error = error;
            this.notify = notify;
            this.dbname = db_name;
            this.storename = store_name;
            this.keypath = key_path;
            this.key = test_data[key_path];
            this.data = test_data;
            this.entryKey = add_key;
          });
          
          it("get.entry should be a success", function() {
            expect(this.notify).toBe(false);
            expect(this.error).toBe(false);
            expect(this.context.error).toBeUndefined();
            expect(this.success).toBe(true);
          });

          it("get.entry should have the correct parent/child relationships", function() {
            expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
          });

          it("get.entry references should be the db, store and index we asked for", function(){
            expect(this.context.db.name).toBe(this.dbname);
            expect(this.context.objectstore.name).toBe(this.storename);
          });

          it("get.entry should return an entry", function(){
            expect(undefined !== this.context.entry).toBe(true);
            expect(null !== this.context.entry).toBe(true);
            expect(this.context.entry.version).toBe(1);
          });

          it("get.entry should return the key", function(){
            expect(this.context.entry[key_path]).toBe(key_path_value);
            expect(this.entryKey).toBe(this.key);
          });

          it("get.entry should clean up after itself", function() {
            dash.remove.database(this.context);
          });
        });
      });

    });

  });
}());

