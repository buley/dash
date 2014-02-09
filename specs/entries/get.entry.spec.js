
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
        key_path_value = 'entry-get-value-' + start_time;
      test_data[key_path] = key_path_value;
      dash.open.database({
          database: db_name,
          store: store_name,
          store_key_path: key_path,
          data: test_data
        })
        .then(function(context){
          dash.add.store(context)
          .then(function(context) {
            delete context.transaction;
            delete context.objectstore;
            delete context.request;
            setTimeout(function(){
              dash.add.entry(context)
              .then(function(context) {
                dash.get.entry(context)
                .then(function(context) {
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
            },20)
          });
        })

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
          });
          
          it("get.entry should be a success", function() {
            expect(this.notify).toBe(false);
            expect(this.error).toBe(false);
            expect(this.context.error).toBeUndefined();
            expect(this.success).toBe(true);
          });

          it("get.entry should have the correct references", function() {
            expect(this.context.db instanceof IDBDatabase).toBe(true);
            expect(this.context.objectstore instanceof IDBObjectStore).toBe(true);
          });

          it("get.entry should have the correct parent/child relationships", function() {
            expect(this.context.db.objectStoreNames.contains(this.context.store)).toBe(true);
          });

          it("get.entry references should be the db, store and index we asked for", function(){
            expect(this.context.db.name).toBe(this.dbname);
            expect(this.context.objectstore.name).toBe(this.storename);
          });

          it("get.entry should return an entry", function(){
            expect(undefined !== this.context.entry).toBe(true);
            expect(null !== this.context.entry).toBe(true);
            expect(this.context.entry.version).toBe(1);
            expect(this.context.entry[key_path]).toBe(key_path_value);
          });

          it("get.entry should return the key", function(){
            expect(this.context.key).toBe(this.key);
          });

          it("get.entry should clean up after itself", function() {
            dash.remove.entry({
              db: this.context.db,
              store: store_name,
              key: this.context.key
            })
            .then(function(context) {
              dash.remove.store(context)
              .then(function(context) {
                dash.close.database(context)
                .then(function() {
                  dash.remove.database(context);
                });
              });
            });
          });
        });
      });

    });

  });
}());

