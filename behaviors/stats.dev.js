window.dashStats = window.dashStats || (function(environment) {
	"use strict";
	var cache = {
		total: {
			requests: {
				add: 0,
				clears: 0,
				counts: 0,
				get: 0,
				put: 0,
				remove: 0,
				update: 0
			},
			resolves: 0,
			notifies: 0,
			errors: 0
		}
	};
	return function(state) {
		var context = state.context;
		if ( !context.stats_start ) {
			console.log('starting',state.type);
			state.context.stats_start = new Date().getTime();
			state.context.stats_operation = state.type;
		} else {
			console.log('finished', context.stats_operation, new Date().getTime() - context.stats_start );
		}
		return state;
	};
}(self));
