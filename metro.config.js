const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const {
  resolver: { sourceExts, assetExts },
} = defaultConfig;

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-typescript-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'ts', 'tsx', 'jsx', 'js', 'json'],
    extraNodeModules: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@web': path.resolve(__dirname, 'src/web'),
      '@desktop': path.resolve(__dirname, 'src/desktop'),
      '@native': path.resolve(__dirname, 'src/native'),
    },
  },
  watchFolders: [
    path.resolve(__dirname, 'src/core'),
    path.resolve(__dirname, 'src/native'),
  ],
};

module.exports = mergeConfig(defaultConfig, config);
