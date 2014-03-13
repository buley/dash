window.dashStats = window.dashStats || (function(w) {
	"use strict";
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
}(window));
