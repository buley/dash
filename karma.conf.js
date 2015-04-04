module.exports = function(config) {
    config.set({
        basePath: './',
        frameworks: ['jasmine'],
        files: [
            'specs/*.js',
            'specs/*/*.js',
            'lib/dash.dev.js'
        ],
        exclude: [],
        reporters: ['progress'],
        port: 1412,
        colors: true,
        //config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,
        autoWatch: true,
        browsers: ['Firefox'], //default TravisCI browser
        sauceLabs: {
            testName: 'dash.js'
        },
        customLaunchers: {
            sl_ios_safari: {
              base: 'SauceLabs',
              browserName: 'iphone',
              platform: 'OS X 10.10',
              version: '8.0'
            },
            sl_ie_11: {
              base: 'SauceLabs',
              browserName: 'internet explorer',
              platform: 'Windows 8.1',
              version: '11'
            }
        },
        captureTimeout: 300000,
        browserDisconnectTimeout: 5000,
        browserDisconnectTolerance: 3,
        captureTimeout: 60000,
        browserNoActivityTimeout: 20000,
        singleRun: false,
        plugins: []
    });
};
