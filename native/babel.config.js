module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['..'],
        alias: {
          '@core': '../src/core',
          '@native': '../src/native',
          '@platform': '../src/native',
        },
      },
    ],
  ],
};
