module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  moduleDirectories: ['node_modules', 'src', './'],
  preset: 'ts-jest',
  testRegex: 'test/.*?\\.(test|spec)\\.tsx?$',
};
