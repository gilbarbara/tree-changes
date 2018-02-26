module.exports = {
  transform: {
    '.*': 'babel-jest',
  },
  moduleFileExtensions: [
    'js',
    'json',
  ],
  moduleDirectories: [
    'node_modules',
    'src',
    './',
  ],
  testRegex: '/.*?\\.(test|spec)\\.js$',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.js',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  verbose: true,
};
