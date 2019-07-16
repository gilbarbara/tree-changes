module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.(j|t)s',
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
  ],
  moduleDirectories: [
    'node_modules',
    'src',
    './',
  ],
  preset: 'ts-jest',
  testRegex: '/.*?\\.(test|spec)\\.*(j|t)s$',
};
