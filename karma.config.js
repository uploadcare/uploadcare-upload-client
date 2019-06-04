process.env.CHROME_BIN = require('puppeteer').executablePath()

console.log(process.env.NODE_ENV)

module.exports = function(config) {
  config.set({
    browserNoActivityTimeout: 60000,
    browsers: ['ChromeHeadless'],
    reporters: ['progress', 'karma-typescript'],
    frameworks: ['jasmine', 'karma-typescript'],
    captureConsole: true,

    files: [
      {
        pattern: 'src/**/*.ts',
        watched: false,
      },
      {
        pattern: 'test/**/*.ts',
        watched: false,
      },
    ],

    plugins: [
      'karma-typescript',
      'karma-chrome-launcher',
      'karma-jasmine',
    ],

    preprocessors: {'**/*.ts': ['karma-typescript']},

    karmaTypescriptConfig: {
      bundlerOptions: {
        addNodeGlobals: true,
        constants: {'process.env': {NODE_ENV: process.env.NODE_ENV}},
      },
      compilerOptions: {
        target: 'es5',
        lib: ['es2015', 'dom'],
        strict: true,
        resolveJsonModule: true,
        noImplicitAny: false,
        strictNullChecks: true,
      },
    },
  })
}
