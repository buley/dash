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
			update: 0,
			attribute: 0,
			behavior: 0,
			store: 0,
			stores: 0,
			entry: 0,
			entries: 0,
			index: 0,
			indexes: 0,
			database: 0,
			databases: 0,
			total: 0
		},
		time: {
			add: 0,
			clears: 0,
			counts: 0,
			get: 0,
			put: 0,
			remove: 0,
			update: 0,
			attribute: 0,
			behavior: 0,
			store: 0,
			stores: 0,
			entry: 0,
			entries: 0,
			index: 0,
			indexes: 0,
			database: 0,
			databases: 0,
			total: 0
		},
		expected: {
			add: 0,
			clears: 0,
			counts: 0,
			get: 0,
			put: 0,
			remove: 0,
			update: 0,
			attribute: 0,
			behavior: 0,
			store: 0,
			stores: 0,
			entry: 0,
			entries: 0,
			index: 0,
			indexes: 0,
			database: 0,
			databases: 0,
			total: 0
		},
		remaining: {
			add: 0,
			clears: 0,
			counts: 0,
			get: 0,
			put: 0,
			remove: 0,
			update: 0,
			attribute: 0,
			behavior: 0,
			store: 0,
			stores: 0,
			entry: 0,
			entries: 0,
			index: 0,
			indexes: 0,
			database: 0,
			databases: 0,
			total: 0
		},
		outcomes: {
			resolve: 0,
			notify: 0,
			error: 0
		},
		milliseconds: {
			total: NaN,
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
		if ( !API.contains([ 'resolve', 'notify', 'error' ], state.type) ) {
			console.log('starting', state.type);
			state.context.statistics = { total: total, request: model() };
			state.context.statistics.request.milliseconds.started = new Date().getTime();
			state.context.statistics.request.type = state.type;
			console.log('x',state.type);
			if ( null !== state.type.match(/\.entries$/) ) {
				console.log('countable', state.type);
				var promise = this.deferred(),
				    deferred = state.promise,
				    that = this;
				deferred( function( state ) {
					console.log('counting',that.api);
					that.api.count.entries( state )( function() {
						console.log('count the request', state.type);
						//promise.resolve(state);
					} );
				});
				state.deferred = promise.promise;
			}

		} else {
			state.context.statistics.request.milliseconds.finished = new Date().getTime();
			state.context.statistics.request.milliseconds.elapsed = state.context.statistics.request.milliseconds.finished - state.context.statistics.request.milliseconds.started;

			var pieces = state.context.statistics.request.type.split('.'),
			    verb = pieces[ 0 ],
			    noun = pieces[ 1 ];

			state.context.statistics.total.time[ noun ] += state.context.statistics.request.milliseconds.elapsed;
			state.context.statistics.total.time[ verb ] += state.context.statistics.request.milliseconds.elapsed;
			state.context.statistics.total.time.total += state.context.statistics.request.milliseconds.elapsed;
			state.context.statistics.request.outcomes[ state.type ] += 1;
			state.context.statistics.total.outcomes[ state.type ] += 1;
			state.context.statistics.request.requests[ verb ] += 1;
			state.context.statistics.total.requests[ verb ] += 1;
			state.context.statistics.request.requests[ noun ] += 1;
			state.context.statistics.total.requests[ noun ] += 1;
			state.context.statistics.request.requests.total += 1;
			state.context.statistics.total.requests.total += 1;
			state.context.statistics.request.metrics[ verb ].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
			state.context.statistics.total.metrics[ verb ].recent.unshift(state.context.statistics.total.milliseconds.elapsed);
			if ( state.context.statistics.request.metrics[ verb ].recent.length > recents ) {
				state.context.statistics.request.metrics[ verb ].recent = state.context.statistics.request.metrics[ verb ].recent.slice(0, recents);
				
			}
			if ( state.context.statistics.total.metrics[ verb ].recent.length > recents ) {
				state.context.statistics.total.metrics[ verb ].recent = state.context.statistics.total.metrics[ verb ].recent.slice(0, recents);
				
			}
		}
		return state;
	};
}(self));
