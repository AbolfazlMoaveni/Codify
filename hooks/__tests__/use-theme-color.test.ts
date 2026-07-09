import { renderHook } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const mockUseColorScheme = jest.fn();

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('returns the light theme color from Colors when no prop override is given', () => {
    mockUseColorScheme.mockReturnValue('light');
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.light.text);
  });

  it('returns the dark theme color from Colors when scheme is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useThemeColor({}, 'background'));
    expect(result.current).toBe(Colors.dark.background);
  });

  it('falls back to the light theme when the color scheme is null', () => {
    mockUseColorScheme.mockReturnValue(null);
    const { result } = renderHook(() => useThemeColor({}, 'tint'));
    expect(result.current).toBe(Colors.light.tint);
  });

  it('prefers the light prop override over the theme color', () => {
    mockUseColorScheme.mockReturnValue('light');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#123456', dark: '#654321' }, 'text')
    );
    expect(result.current).toBe('#123456');
  });

  it('prefers the dark prop override over the theme color', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#123456', dark: '#654321' }, 'text')
    );
    expect(result.current).toBe('#654321');
  });

  it('ignores an override for the opposite theme', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useThemeColor({ light: '#123456' }, 'icon'));
    expect(result.current).toBe(Colors.dark.icon);
  });
});
