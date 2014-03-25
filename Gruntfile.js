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
        plugins.push('karma-safari-launcher');
        plugins.push('karma-ie-launcher');
        plugins.push('karma-opera-launcher');
        plugins.push('karma-sauce-launcher');
        browsers.push('Chrome');
        browsers.push('Firefox');
        browsers.push('Safari');
        browsers.push('Opera');
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
                        'dist/dash.min.js',
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
            dev: {
                singleRun: true,
                autoWatch: false,
                browsers: browsers,
                plugins: plugins,
                options: {
                    files: [
                        'dist/dash.js',
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
                        'dist/dash.js',
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
                        'dist/dash.js',
                        'specs/*.js',
                        'specs/*/*.js'
                    ]
                },
                reporters: ['dots']
            },
            safari: {
                singleRun: false,
                autoWatch: true,
                browsers: ['Safari'],
                plugins: plugins,
                options: {
                    files: [
                        'dist/dash.js',
                        'specs/*.js',
                        'specs/*/*.js'
                    ]
                },
                reporters: ['dots']
            },
            opera: {
                singleRun: false,
                autoWatch: true,
                browsers: ['Opera'],
                plugins: plugins,
                options: {
                    files: [
                        'dist/dash.js',
                        'specs/*.js',
                        'specs/*/*.js'
                    ]
                },
                reporters: ['dots']
            },
            ie: {
                singleRun: false,
                autoWatch: true,
                browsers: ['IE'],
                plugins: plugins,
                options: {
                    files: [
                        'dist/dash.js',
                        'specs/*.js',
                        'specs/*/*.js'
                    ]
                },
                reporters: ['dots']
            }
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
    grunt.registerTask('safari', ['karma:safari']);
    grunt.registerTask('opera', ['karma:opera']);
    grunt.registerTask('ie', ['karma:ie']);
    grunt.registerTask('default', ['dev', 'coveralls']);
};
