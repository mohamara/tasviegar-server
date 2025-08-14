module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'backend',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
