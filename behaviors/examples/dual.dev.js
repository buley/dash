window.dashBehavior = ( function(environment) {
	"use strict";
	return function(ctx) {
		if ( null !== ctx.promise ) {
			console.log('action');
		} else {
			console.log('filter');
		}
		return ctx;
	};
}(window) );
