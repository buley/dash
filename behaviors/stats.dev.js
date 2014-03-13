window.dashStats = window.dashStats || (function(w) {
	"use strict";
	return function(ctx) {
		var promise = this.deferred(),
		    deferred = ctx.promise;
		if ( null !== deferred ) {
		deferred( function( state ) {
			console.log('theirs resolved', state);
			setTimeout( function() {
				console.log('module before and after callback', state);
				promise.resolve(state);
			}, 20 );
		}, function(context) {
			throw new Error(context);
		}, function(ctx) {
			console.log('notify',ctx);
		} );
		console.log('attaching', promise);
		ctx.deferred = promise.promise;
		}
		return ctx;
	};
	return [ function(ctx) {
		console.log('module before callback');
		return ctx;
	}, function(ctx) {
		console.log('module after callback');
		return ctx;
	} ];
}(window));
