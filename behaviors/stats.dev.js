window.dashStats = window.dashStats || (function(w) {
	"use strict";
	return function(ctx) {
		console.log('module before and after callback');
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
