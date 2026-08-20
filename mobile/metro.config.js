const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch shared directory outside mobile root
const sharedRoot = path.resolve(__dirname, '../shared');
config.watchFolders = [sharedRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
