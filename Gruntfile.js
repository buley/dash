'use strict';

module.exports = function(grunt) {
  var plugins = [];
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
	  configFile: 'karma.conf.js',
	  browsers: browsers,
	  plugins: plugins
    }
  });
  //grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('default', ['test']);
};
