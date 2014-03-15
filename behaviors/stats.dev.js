window.dashStats = window.dashStats || (function(environment) {
	"use strict";
	var model = function() {
	    return {
		request: {
			start: NaN,
			complete: NaN,
			
		},
		requests: {
			add: 0,
			clears: 0,
			counts: 0,
			get: 0,
			put: 0,
			remove: 0,
			update: 0
		},
		targets: {
			attribute: 0,
			behavior: 0,
			store: 0,
			stores: 0,
			entry: 0,
			entries: 0,
			index: 0,
			indexes: 0,
			database: 0,
			databases: 0
		},
		resolves: 0,
		notifies: 0,
		milliseconds: {
			start: NaN,
			elapsed: NaN,
			remaining: NaN
		},
		display: {
			elapsed: '',
			remaining: ''
		}
		metrics: {
			adds: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			clears: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			counts: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			gets: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			puts: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			removes: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			updates: {
				average: NaN,
				rate: NaN,
				recent: []
			}
		},
		dom: {
			node: null
		}
	    };
	},
	total = model();
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
