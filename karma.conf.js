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
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,
    autoWatch: true,
    //browsers: ['Chrome', 'Firefox' ],
    //browsers: ['Chrome'],
    browsers: ['Firefox'],
    captureTimeout: 60000,
    singleRun: false,
    preprocessors: {
      "lib/*.dev.js": "coverage"
    },
    coverageReporter: {
      type: "lcov",
      dir: "coverage/"
    },
    plugins: [
      'karma-coverage',
    ]
  });
};
