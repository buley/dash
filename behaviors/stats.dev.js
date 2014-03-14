window.dashStats = window.dashStats || (function(environment) {
	"use strict";
	console.log('dashStats setup',environment.dash);
	environment.dash.add.attribute( [ 'stats_id', 'stats_start' ] );
	return function(ctx) {
		/*
		var promise = this.deferred(),
		    deferred = ctx.promise;
		deferred( function( state ) {
			setTimeout( function() {
				console.log('module before callback', ctx.type);
				promise.resolve(state);
			}, 20 );
		});
		ctx.deferred = promise.promise;
		*/
		var context = ctx.context;
		if ( !context.stats_start ) {
			ctx.context.stats_start = new Date().getTime();
			console.log('started');
		} else {
			console.log('finished', new Date().getTime() - context.stats_start );
		}
		return ctx;
	};
}(self));
