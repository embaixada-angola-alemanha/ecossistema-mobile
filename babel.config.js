module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@components': './src/components',
          '@store': './src/store',
          '@config': './src/config',
          '@utils': './src/utils',
          '@types': './src/types',
          '@assets': './assets',
        },
      },
    ],
  ],
};
