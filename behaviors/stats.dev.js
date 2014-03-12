window.dashStats = window.dashStats || (function(w) {
	"use strict";
	return function(ctx) {
		var promise = ctx.promise,
		    deferred = this.promise();
		promise( function( context ) {
			setTimeout( function() 
				console.log('module before and after callback', context);
				deferred.resolve(ctx);
			}, 0 );
		} );
		ctx.promise = deferred;
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
