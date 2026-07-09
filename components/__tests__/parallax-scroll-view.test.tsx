import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#222222',
}));

const mockUseColorScheme = jest.fn();
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

import ParallaxScrollView from '@/components/parallax-scroll-view';

describe('ParallaxScrollView', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  const headerColors = { light: '#eeeeee', dark: '#111111' };

  it('renders the header and body content', () => {
    const { getByText } = render(
      <ParallaxScrollView
        headerImage={<Text>header</Text>}
        headerBackgroundColor={headerColors}>
        <Text>body</Text>
      </ParallaxScrollView>
    );
    expect(getByText('header')).toBeTruthy();
    expect(getByText('body')).toBeTruthy();
  });

  it('renders without crashing when the color scheme is null', () => {
    mockUseColorScheme.mockReturnValue(null);
    const { getByText } = render(
      <ParallaxScrollView
        headerImage={<Text>header</Text>}
        headerBackgroundColor={headerColors}>
        <Text>body</Text>
      </ParallaxScrollView>
    );
    expect(getByText('body')).toBeTruthy();
  });
});
