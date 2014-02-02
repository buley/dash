describe("open.database", function() {
	var start_time = new Date().getTime(),
		db_name = 'store-open-test-' + start_time;
	dash.open.database({ database: db_name })
		.then(function(context) {
			it("should have a context.db that's an instanceof IDBDatabase", function() {
				expect(dash.tools.exists(context.db)).toBe(true);
				expect(context.db instanceof IDBDatabase).toBe(true);
			});
			it('should have the correct database name', function() {
				expect(dash.tools.exists(db.name)).toBe(true);
				expect(context.db.name).toBe(db_name);
			});
			it('should have a version', function() {
				expect(dash.tools.exists(db.version)).toBe(true);
				expect(isNaN(db.version)).toBe(false);
				expect(db.version > 0).toBe(true);
			});
		}, function(context) {
			it('should not throw an error', function() {
				expect(dash.tools.exists(context.db)).toBe(true);
				expect(dash.tools.empty(context.error)).toBe(true);
			});
		})
		.then(dash.close.database)
		.then(dash.remove.database);
});
