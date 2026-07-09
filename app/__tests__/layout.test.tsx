import { render } from '@testing-library/react-native';

const mockUseColorScheme = jest.fn();
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  const Stack = ({ children }: any) => <View testID="stack">{children}</View>;
  Stack.Screen = ({ name }: any) => <View testID={`screen-${name}`} />;
  return { Stack };
});

jest.mock('expo-status-bar', () => {
  const { View } = require('react-native');
  return { StatusBar: () => <View testID="status-bar" /> };
});

jest.mock('@react-navigation/native', () => ({
  ThemeProvider: ({ children }: any) => children,
  DarkTheme: { dark: true },
  DefaultTheme: { dark: false },
}));

import RootLayout from '@/app/_layout';

describe('RootLayout', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('renders the navigation stack with the tabs and modal screens (light theme)', () => {
    mockUseColorScheme.mockReturnValue('light');
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId('stack')).toBeTruthy();
    expect(getByTestId('screen-(tabs)')).toBeTruthy();
    expect(getByTestId('screen-modal')).toBeTruthy();
    expect(getByTestId('status-bar')).toBeTruthy();
  });

  it('renders without crashing in dark mode', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId('stack')).toBeTruthy();
  });
});
