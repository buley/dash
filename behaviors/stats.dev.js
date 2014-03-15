window.dashStats = window.dashStats || (function(environment) {
	"use strict";
	var model = function() {
	    return {
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
		outcomes: {
			resolve: 0,
			notify: 0,
			error: 0
		},
		milliseconds: {
			start: NaN,
			elapsed: NaN,
			remaining: NaN
		},
		display: {
			elapsed: '',
			remaining: ''
		},
		metrics: {
			add: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			clear: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			count: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			get: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			put: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			remove: {
				average: NaN,
				rate: NaN,
				recent: []
			},
			update: {
				average: NaN,
				rate: NaN,
				recent: []
			}
		},
		type: null,
		dom: {
			node: null
		}
	    };
	},
	recents = 5,
	total = model();
	return function(state) {
		var context = state.context;
		if ( !context.stats_start ) {
			console.log('starting',state.type);

			stats.context.statistics = { total: total, request: model() };
			state.context.statistics.request.milliseconds.start = new Date().getTime();
			state.context.statistics.request.type = state.type;
		} else {
			state.context.statistics.request.milliseconds.finished = new Date().getTime();
			state.context.statistics.request.milliseconds.elapsed = state.context.statistics.milliseconds.finished - state.context.statistics.milliseconds.started;
			var pieces = state.context.statistics.request.type.split('.'),
			    verb = pieces[ 0 ],
			    noun = pieces[ 1 ];
			state.context.statistics.request.outcomes[ state.type ] += 1;
			state.context.statistics.total.outcomes[ state.type ] += 1;
			state.context.statistics.request.requests[ verb ] += 1;
			state.context.statistics.total.requests[ verb ] += 1;
			state.context.statistics.request.targets[ noun ] += 1;
			state.context.statistics.total.targets[ noun ] += 1;
			state.context.statistics.request.metrics[ verb ].recent.unshift(state.contex.statistics.milliseconds.elapsed);
			state.context.statistics.total.metrics[ verb ].recent.unshift(state.contex.statistics.milliseconds.elapsed);
			if ( state.context.statistics.request.metrics[ verb ].recent.length > recents ) {
				state.context.statistics.request.metrics[ verb ].recent = state.context.statistics.request.metrics[ verb ].recent.slice(0, 5);
				
			}
			if ( state.context.statistics.total.metrics[ verb ].recent.length > recents ) {
				state.context.statistics.total.metrics[ verb ].recent = state.context.statistics.total.metrics[ verb ].recent.slice(0, 5);
				
			}
			console.log('stats', state.contet.statistics);
		}
		return state;
	};
}(self));
