window.dashBehavior = ( function(environment) {
	"use strict";
	return [ function(ctx) {
		var promise = this.deferred(),
		    deferred = ctx.promise;
		deferred( function( state ) {
			setTimeout( function() {
				promise.resolve(state);
			}, 1000 );
		});
		ctx.deferred = promise.promise;
		return ctx;
	}, function(ctx) {
		return ctx;
	} ];
}(window) );
