import { render, fireEvent } from '@testing-library/react-native';

const mockOpenBrowserAsync = jest.fn();

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpenBrowserAsync(...args),
  WebBrowserPresentationStyle: { AUTOMATIC: 'automatic' },
}));

jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    Link: ({ href, onPress, children }: any) => (
      <Text accessibilityRole="link" onPress={onPress} href={href}>
        {children ?? href}
      </Text>
    ),
  };
});

import { ExternalLink } from '@/components/external-link';

// Compiled with EXPO_OS === 'ios' under the iOS Jest project (native path).
describe('ExternalLink (native)', () => {
  beforeEach(() => {
    mockOpenBrowserAsync.mockReset();
    mockOpenBrowserAsync.mockResolvedValue(undefined);
  });

  it('renders a link for the given href', () => {
    const { getByText } = render(<ExternalLink href="https://example.com" />);
    expect(getByText('https://example.com')).toBeTruthy();
  });

  it('prevents default navigation and opens an in-app browser', () => {
    const preventDefault = jest.fn();
    const { getByText } = render(<ExternalLink href="https://example.com" />);

    fireEvent.press(getByText('https://example.com'), { preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(mockOpenBrowserAsync).toHaveBeenCalledWith('https://example.com', {
      presentationStyle: 'automatic',
    });
  });
});
