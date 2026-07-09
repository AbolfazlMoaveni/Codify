import { useColorScheme as useColorSchemeRN } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

// On native platforms the hook is a direct re-export of React Native's hook.
describe('useColorScheme (native re-export)', () => {
  it('re-exports the React Native useColorScheme hook', () => {
    expect(useColorScheme).toBe(useColorSchemeRN);
    expect(typeof useColorScheme).toBe('function');
  });
});
