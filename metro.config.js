const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Add support for local modules
const modulePaths = [
  path.resolve(__dirname, 'modules/crypto-native'),
  path.resolve(__dirname, 'modules/otp-native'),
];

module.exports = {
  ...defaultConfig,
  watchFolders: [
    ...defaultConfig.watchFolders,
    ...modulePaths,
  ],
  resolver: {
    ...defaultConfig.resolver,
    nodeModulesPaths: [
      ...defaultConfig.resolver.nodeModulesPaths,
      ...modulePaths,
    ],
  },
  // You can add any project-specific Metro customizations here
  // For example, to add 'svg' support:
  // resolver: {
  //   ...defaultConfig.resolver,
  //   assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
  //   sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  // },
}; 