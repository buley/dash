'use strict';

module.exports = function(grunt) {
  var plugins = [ 'karma-jasmine' ];
  var browsers = [];
  if (process.env.TRAVIS) {
    plugins.push('karma-firefox-launcher');
    browsers.push('Firefox');
  } else {
    plugins.push('karma-chrome-launcher');
    plugins.push('karma-firefox-launcher');
    browsers.push('Chrome');
    browsers.push('Firefox');
  }
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      options: {
	    configFile: 'karma.conf.js'
      },
	  prod: {
	    singleRun: true,
	    autoWatch: false,
		browsers: browsers,
	    plugins: plugins,
		options: {
			files: [
			  'lib/dash.js',
			  'specs/*.js',
			  'specs/*/*.js'
			]
		},
	    reporters: [ 'dots' ]
	  },
	  dev: {
	    singleRun: false,
	    autoWatch: true,
		browsers: browsers,
	    plugins: plugins,
		options: {
			files: [
			  'lib/dash.dev.js',
			  'specs/*.js',
			  'specs/*/*.js'
			]
		},
	    reporters: [ 'dots' ]
	  },
	  chrome: {
	    singleRun: false,
	    autoWatch: true,
		browsers: [ 'Chrome' ],
	    plugins: plugins,
		options: {
			files: [
			  'lib/dash.dev.js',
			  'specs/*.js',
			  'specs/*/*.js'
			]
		},
	    reporters: [ 'dots' ]
	  },
	  firefox: {
	    singleRun: false,
	    autoWatch: true,
		browsers: [ 'Firefox' ],
	    plugins: plugins,
		options: {
			files: [
			  'lib/dash.dev.js',
			  'specs/*.js',
			  'specs/*/*.js'
			]
		},
		reporters: [ 'dots' ]
	  },
    }
  });
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('prod', ['karma:prod']);
  grunt.registerTask('dev', ['karma:dev']);
  grunt.registerTask('firefox', ['karma:firefox']);
  grunt.registerTask('chrome', ['karma:chrome']);
  grunt.registerTask('default', ['prod']);
};
