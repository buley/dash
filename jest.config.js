module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    coverageDirectory: 'coverage',
    collectCoverage: true,
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
  };
  