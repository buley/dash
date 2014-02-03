'use strict';

module.exports = function(grunt) {
  var plugins = [ 'karma-jasmine' ];
  var browsers = [];
  if (process.env.TRAVIS) {
    plugins.push('karma-firefox-launcher');
    browsers.push('Firefox');
  } else {
    plugins.push('karma-chrome-launcher');
    browsers.push('Chrome');
  }
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      options: {
	    configFile: 'karma.conf.js'
      },
	  dev: {
	    browsers: browsers,
	    plugins: plugins,
	    autoWatch: false,
	    singleRun: true,
	    reporters: [ 'dots' ]
	  }
    }
  });
  //grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('default', ['test']);
};
