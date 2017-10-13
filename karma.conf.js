module.exports = function(config) {
    config.set({
        basePath: './',
        frameworks: ['jasmine'],
        files: [
            'specs/*.js',
            'specs/*/*.js',
            'dist/dash.js'
        ],
        exclude: [],
        reporters: ['progress'],
        port: 1412,
        colors: true,
        //config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Firefox'], //default TravisCI browser
        sauceLabs: {
            testName: 'dash.js'
        },
        customLaunchers: {},
        captureTimeout: 300000,
        browserDisconnectTimeout: 5000,
        browserDisconnectTolerance: 3,
        browserNoActivityTimeout: 20000,
        singleRun: false,
        plugins: []
    });
};
