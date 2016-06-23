module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    files: [
      '*.html',
      'js/**/*.js',
      'test/**/test_*.js'
    ],
    exclude: [
    ],
    preprocessors: {"js/**/*.js": ['coverage']},
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: "html",
      dir: "coverage/"
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};