module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@web/(.*)$': '<rootDir>/src/web/$1',
    '^@desktop/(.*)$': '<rootDir>/src/desktop/$1',
    '^@native/(.*)$': '<rootDir>/src/native/$1',
  },
  transform: {
    '^.+\\.ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/native/android/', // Ignore native Android project files
    '/native/ios/',     // Ignore native iOS project files
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Optional: for global setup
};
