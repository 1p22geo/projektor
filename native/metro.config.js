const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const {
  resolver: { sourceExts, assetExts },
} = defaultConfig;

const config = {
  projectRoot: __dirname,
  watchFolders: [
    path.resolve(__dirname, '../'), // Watch the entire monorepo root
  ],
  transformer: {
    // Use default transformer, babel-preset handles TypeScript
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
    },
    nodeModulesPaths: [
      path.resolve(__dirname, '../node_modules'), // Root node_modules (hoisted)
      path.resolve(__dirname, 'node_modules'),    // Native app's node_modules
    ],
    unstable_enableSymlinks: true,
  },
};

module.exports = mergeConfig(defaultConfig, config);
