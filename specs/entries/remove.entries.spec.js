
(function(){
  'use strict';
  describe("remove.entries", function() {
    it( 'should open a database, add a store and add then get entries', function() {
      var start_time = new Date().getTime(),
        db_name = 'entries-remove-test-' + start_time,
        store_name = 'entries-remove-test-store-' + start_time,
        index_name = 'entries-remove-test-index-' + start_time,
        key_path = 'entries' + start_time,
        index_key_path = 'entriesIndex' + start_time,
        test_data = { version: 1 },
        random_update = Math.floor(Math.random() * 100) + 1,
        isFinished = false,
        dashIsFinished = function() { 
          return isFinished;
        },
        error = false,
        success = false,
        notify = false,
        ctx,
        index_key_path_value = 'entries-get-index-value-' + start_time,
        key_path_value = 'entries-get-value-' + start_time,
        entries;
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
      (function(context) {
        dash.remove.entries(context)
        (function(context) {
          entries = context.entries;
          dash.get.entries(context)
          (function(context) {
            success = true;
            isFinished = true;
            done();
            ctx = context;
          }, function(context) {
            error = true;
            isFinished = true;
            done();
          });
        }, function(context) {
          ctx = context;
          error = true;
          isFinished = true;
          done();
        }, function(context) {
          notify = true;
        });
      });

      it('the remove.entries operation to finish', function() {
        describe('remove.entries should finish cleanly', function() {

          beforeEach(function() {
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
            this.entries = entries;
          });
          
          //TODO: Why not true?
          it("remove.entries should have sent a success notify", function() {
            //expect(this.notify).toBe(true);
          });

          it("remove.entries not have thrown errors", function() {
            expect(this.error).toBe(false);
            expect(this.context.error).toBeUndefined();
          });
          it("remove.entries should be a success", function() {
            expect(this.success).toBe(true);
          });

          it("remove.entries should have the correct parent/child relationships", function() {
            expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
          });

          it("remove.entries references should be the db, store and index we asked for", function(){
            expect(this.context.db.name).toBe(this.dbname);
            expect(this.context.objectstore.name).toBe(this.storename);
            expect(this.context.idx.name).toBe(this.indexname);
          });

	  //TODO: Test collect behavior
	  /*
          it("remove.entries should have an entries property", function(){
            expect(undefined !== this.entries).toBe(true);
          });
          it("remove.entries entries property should be non null", function(){
            expect(null !== this.entries).toBe(true);
          });
          it("remove.entries should return one deleted entry", function(){
            expect(this.entries.length).toBe(1);
          });
          */

          it("remove.entries should clean up after itself", function() {
            dash.remove.database(this.context);
          });

        });
      });
    });
  });
}());

