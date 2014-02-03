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
      options: {
        browsers: browsers,
        files: [
		  'lib/dash.dev.js',
          'specs/**/*.js'
        ],
        frameworks: [],
        plugins: plugins
      },
      continuous: {
        singleRun: true
      },
      dev: {
        reporters: 'dots',
        background: true
      },
      auto: {
        autoWatch: true
      }
    }
  });
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['test']);
};
