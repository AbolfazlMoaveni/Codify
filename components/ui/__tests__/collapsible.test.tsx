import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Colors } from '@/constants/theme';

const mockUseColorScheme = jest.fn();

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

jest.mock('@/components/ui/icon-symbol', () => {
  const { Text: RNText } = require('react-native');
  return {
    IconSymbol: ({ color, style }: any) => (
      <RNText testID="chevron" style={style} data-color={color} />
    ),
  };
});

import { Collapsible } from '@/components/ui/collapsible';

const flatten = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

describe('Collapsible', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('renders the title', () => {
    const { getByText } = render(
      <Collapsible title="Section">
        <Text>hidden content</Text>
      </Collapsible>
    );
    expect(getByText('Section')).toBeTruthy();
  });

  it('hides its children until the heading is pressed', () => {
    const { queryByText, getByText } = render(
      <Collapsible title="Section">
        <Text>hidden content</Text>
      </Collapsible>
    );
    expect(queryByText('hidden content')).toBeNull();

    fireEvent.press(getByText('Section'));
    expect(queryByText('hidden content')).toBeTruthy();
  });

  it('toggles children off again on a second press', () => {
    const { queryByText, getByText } = render(
      <Collapsible title="Section">
        <Text>hidden content</Text>
      </Collapsible>
    );
    fireEvent.press(getByText('Section'));
    expect(queryByText('hidden content')).toBeTruthy();

    fireEvent.press(getByText('Section'));
    expect(queryByText('hidden content')).toBeNull();
  });

  it('rotates the chevron when opened', () => {
    const { getByTestId, getByText } = render(
      <Collapsible title="Section">
        <Text>hidden content</Text>
      </Collapsible>
    );
    const rotation = () =>
      (flatten(getByTestId('chevron').props.style).transform as { rotate: string }[])[0].rotate;

    expect(rotation()).toBe('0deg');
    fireEvent.press(getByText('Section'));
    expect(rotation()).toBe('90deg');
  });

  it('uses the dark icon color when the color scheme is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { getByTestId } = render(
      <Collapsible title="Section">
        <Text>hidden content</Text>
      </Collapsible>
    );
    expect(getByTestId('chevron').props['data-color']).toBe(Colors.dark.icon);
  });

  it('falls back to the light icon color when the scheme is null', () => {
    mockUseColorScheme.mockReturnValue(null);
    const { getByTestId } = render(
      <Collapsible title="Section">
        <Text>hidden content</Text>
      </Collapsible>
    );
    expect(getByTestId('chevron').props['data-color']).toBe(Colors.light.icon);
  });
});
