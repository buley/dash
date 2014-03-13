window.dashStats = window.dashStats || (function(w) {
	"use strict";
	return function(ctx) {
		var promise = this.deferred(),
		    deferred = ctx.promise;
		if ( null !== deferred ) {
		console.log('attaching');
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
		ctx.deferred = promise;
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
