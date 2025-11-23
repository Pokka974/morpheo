const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add shared libraries to watchFolders for Metro bundler
config.watchFolders = [
  path.resolve(__dirname, '../../libs/constants'),
  path.resolve(__dirname, '../../libs/types'),
  path.resolve(__dirname, '../../libs/utils'),
  path.resolve(__dirname, '../../libs/validation'),
];

// Update resolver to handle monorepo paths
config.resolver.alias = {
  '@morpheo/constants': path.resolve(
    __dirname,
    '../../libs/constants/src/index.js',
  ),
  '@morpheo/types': path.resolve(__dirname, '../../libs/types/src/index.js'),
  '@morpheo/utils': path.resolve(__dirname, '../../libs/utils/src/index.js'),
  '@morpheo/validation': path.resolve(
    __dirname,
    '../../libs/validation/src/index.js',
  ),
};

try {
  module.exports = wrapWithReanimatedMetroConfig(
    withNativeWind(config, { input: './global.css' }),
  );
} catch (error) {
  console.error('Error wrapping metro config:', error);
  module.exports = config;
}
