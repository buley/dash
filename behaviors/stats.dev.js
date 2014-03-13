window.dashStats = window.dashStats || (function(w) {
	"use strict";
	return function(ctx) {
		var promise = this.deferred(),
		    deferred = ctx.promise;
		if ( null !== deferred ) { //filter (before)
			deferred( function( state ) {
				setTimeout( function() {
					console.log('filter',state);
					promise.resolve(state);
				}, 20 );
			});
			ctx.deferred = promise.promise;
		} else {
			//action (after)
			console.log('action',ctx.context.entry.se);
			ctx.context.entry.se = 'Rick Roll';
			ctx.type = 'reject';
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
