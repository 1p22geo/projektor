module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
    '@babel/preset-flow'
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@core': './src/core',
          '@web': './src/web',
          '@desktop': './src/desktop',
          '@native': './src/native',
          '@platform': './src/web',
        },
      },
    ],
  ],
};