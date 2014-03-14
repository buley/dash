window.dashStats = window.dashStats || (function(environment) {
	"use strict";
	console.log('dashStats setup',environment.dash);
	environment.dash.add.attribute( [ 'stats_id', 'stats_start' ] );
	return function(ctx) {
		var promise = this.deferred(),
		    deferred = ctx.promise;
		deferred( function( state ) {
			setTimeout( function() {
				console.log('module before callback', ctx.type);
				promise.resolve(state);
			}, 20 );
		});
		ctx.deferred = promise.promise;
		return ctx;
	};
}(self));
