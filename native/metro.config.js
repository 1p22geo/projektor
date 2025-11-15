const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const {
  resolver: { sourceExts, assetExts },
} = defaultConfig;

const config = {
  projectRoot: __dirname,
  watchFolders: [
    path.resolve(__dirname, '..'),
  ],
  transformer: {
    babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'ts', 'tsx', 'jsx', 'js', 'json'],
    extraNodeModules: {
      '@core': path.resolve(__dirname, '../src/core'),
      '@web': path.resolve(__dirname, '../src/web'),
      '@desktop': path.resolve(__dirname, '../src/desktop'),
      '@native': path.resolve(__dirname, '../src/native'),
      '@platform': path.resolve(__dirname, '../src/native'),
      '@babel': path.resolve(__dirname, 'node_modules/@babel'),
    },
    nodeModulesPaths: [
      path.resolve(__dirname, '../node_modules'),
      path.resolve(__dirname, 'node_modules'),
    ],
    unstable_enableSymlinks: true,
  },
};

module.exports = mergeConfig(defaultConfig, config);
