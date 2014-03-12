window.dashStats = window.dashStats || (function(w) {
	"use strict";
	return function(ctx) {
		var promise = this.deferred(),
		    deferred = ctx.promise;
		if ( null !== promise ) {
		deferred( function( state ) {
			setTimeout( function() {
				console.log('module before and after callback', state);
				promise.resolve(state);
			}, 0 );
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
