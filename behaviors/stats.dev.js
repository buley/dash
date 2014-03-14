window.dashStats = window.dashStats || (function(environment) {
	"use strict";
	return function(state) {
		/*
		var promise = this.deferred(),
		    deferred = state.promise;
		deferred( function( state ) {
			setTimeout( function() {
				console.log('module before callback', state.type);
				promise.resolve(state);
			}, 20 );
		});
		state.deferred = promise.promise;
		*/
		var context = state.context;
		if ( !context.stats_start ) {
			state.context.stats_start = new Date().getTime();
		} else {
			console.log('finished', new Date().getTime() - context.stats_start );
		}
		return state;
	};
}(self));
