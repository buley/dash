'use strict';

module.exports = function (grunt) {
    var plugins = ['karma-jasmine', 'karma-coverage'];
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
                        'lib/dash.min.js',
                        'specs/*.js',
                        'specs/*/*.js'
                    ]
                },
                reporters: ['dots', 'coverage'],
                preprocessors: {
                    "lib/*js": "coverage"
                },
                coverageReporter: {
                    type: "lcov",
                    dir: "coverage/"
                },
            },
            dev: {
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
                reporters: ['dots', 'coverage'],
                preprocessors: {
                    "lib/*js": "coverage"
                },
                coverageReporter: {
                    type: "lcov",
                    dir: "coverage/"
                }
            },
            chrome: {
                singleRun: false,
                autoWatch: true,
                browsers: ['Chrome'],
                plugins: plugins,
                options: {
                    files: [
                        'lib/dash.js',
                        'specs/*.js',
                        'specs/*/*.js'
                    ]
                },
                reporters: ['dots']
            },
            firefox: {
                singleRun: false,
                autoWatch: true,
                browsers: ['Firefox'],
                plugins: plugins,
                options: {
                    files: [
                        'lib/dash.js',
                        'specs/*.js',
                        'specs/*/*.js'
                    ]
                },
                reporters: ['dots']
            },
        },
        coveralls: {
            options: {
                debug: true,
                coverageDir: 'coverage/Firefox*'
            }
        }
    });
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-karma-coveralls');
    grunt.registerTask('prod', ['karma:prod']);
    grunt.registerTask('dev', ['karma:dev']);
    grunt.registerTask('firefox', ['karma:firefox']);
    grunt.registerTask('chrome', ['karma:chrome']);
    grunt.registerTask('default', ['dev', 'coveralls']);
};
