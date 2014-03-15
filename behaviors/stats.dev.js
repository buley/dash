window.dashStats = window.dashStats || (function(environment) {
	"use strict";
	return function(state) {
		var context = state.context;
		if ( !context.stats_start ) {
			console.log('starting',state.type);
			state.context.stats_start = new Date().getTime();
			stats.context.stats_operation = state.type;
		} else {
			console.log('finished', context.stats_operation, new Date().getTime() - context.stats_start );
		}
		return state;
	};
}(self));
