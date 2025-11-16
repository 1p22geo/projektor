module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@web/(.*)$': '<rootDir>/src/web/$1',
    '^@desktop/(.*)$': '<rootDir>/src/desktop/$1',
    '^@native/(.*)$': '<rootDir>/src/native/$1',
    '^@platform/(.*)$': '<rootDir>/src/web/$1',
    '^react-native$': 'react-native-web',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-paper)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/native/android/',
    '/native/ios/',
    '/src/native/',
    '/e2e/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
