
(function(){
  'use strict';
  describe("get.entry", function() {
    describe( 'should open a database, add a store and add then get an entry', function() {
      var start_time = new Date().getTime(),
        db_name = 'entry-get-test-' + start_time,
        store_name = 'entry-get-test-store-' + start_time,
        key_path = 'entry' + start_time,
        test_data = { version: 1 },
        error = false,
        success = false,
        notify = false,
        ctx,
        key_path_value = 'entry-get-value-' + start_time,
        add_key;
      test_data[key_path] = key_path_value;
      beforeEach(function(done) {
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
                  ctx = context;
                  done();
                }, function(context) {
                  ctx = context;
                  error = true;
                  done();
                }, function(context) {
                  notify = true;
                });
              });
      });

      describe('get.entry should finish cleanly', function() {

        beforeEach(function(done) {
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
          done();
        });
        
        it("get.entry should be a success", function() {
          expect(this.notify).toBe(false);
          expect(this.error).toBe(false);
          expect(this.context.error).toBeUndefined();
          expect(this.success).toBe(true);
          expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
          expect(this.context.db.name).toBe(this.dbname);
          expect(this.context.objectstore.name).toBe(this.storename);
          expect(undefined !== this.context.entry).toBe(true);
          expect(null !== this.context.entry).toBe(true);
          expect(this.context.entry.version).toBe(1);
          expect(this.context.entry[key_path]).toBe(key_path_value);
          expect(this.entryKey).toBe(this.key);
          dash.remove.database(this.context);
        });
      });
    });


  });
}());

