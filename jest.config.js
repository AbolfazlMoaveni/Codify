// Multi-platform Jest setup for the Expo app.
//
// `process.env.EXPO_OS` / `Platform.OS` are inlined at transform time by the
// jest-expo babel caller, so platform-specific branches (e.g. the iOS-only
// haptics in HapticTab, or the Material Icons vs SF Symbols icon fallback that
// is chosen via `.ios` file resolution) can only be exercised by compiling the
// code for that platform.
//
// We therefore run two projects against the native react-test-renderer (which
// @testing-library/react-native drives): a default "ios" project and an
// "android" project for `*.android.test.*` files. We deliberately avoid the
// jest-expo web preset here because it renders through react-native-web/jsdom,
// which is not compatible with the react-native testing-library queries.
const { getIOSPreset, getAndroidPreset } = require('jest-expo/config');

const transformIgnorePatterns = [
  'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-worklets|react-native-reanimated))',
];

function project(preset, overrides) {
  // `watchPlugins` is only valid at the top level of a Jest config, not inside
  // a project entry, so drop the ones the platform presets bundle.
  const { watchPlugins, ...rest } = preset;
  void watchPlugins;
  return {
    ...rest,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns,
    ...overrides,
  };
}

module.exports = {
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'constants/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  projects: [
    project(getIOSPreset(), {
      displayName: 'ios',
      testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
      testPathIgnorePatterns: ['/node_modules/', '\\.android\\.test\\.'],
    }),
    project(getAndroidPreset(), {
      displayName: 'android',
      testMatch: ['**/__tests__/**/*.android.test.{ts,tsx}'],
    }),
  ],
};
