import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemedView } from '@/components/themed-view';

const mockUseThemeColor = jest.fn();

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: (...args: unknown[]) => mockUseThemeColor(...args),
}));

const flatten = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

describe('ThemedView', () => {
  beforeEach(() => {
    mockUseThemeColor.mockReset();
    mockUseThemeColor.mockReturnValue('#101010');
  });

  it('applies the resolved background color', () => {
    const { getByTestId } = render(<ThemedView testID="view" />);
    expect(flatten(getByTestId('view').props.style).backgroundColor).toBe('#101010');
  });

  it('requests the background color from useThemeColor with overrides', () => {
    render(<ThemedView lightColor="#eee" darkColor="#111" />);
    expect(mockUseThemeColor).toHaveBeenCalledWith({ light: '#eee', dark: '#111' }, 'background');
  });

  it('merges a custom style with the background color', () => {
    const { getByTestId } = render(<ThemedView testID="view" style={{ padding: 12 }} />);
    const style = flatten(getByTestId('view').props.style);
    expect(style.backgroundColor).toBe('#101010');
    expect(style.padding).toBe(12);
  });

  it('renders its children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>child</Text>
      </ThemedView>
    );
    expect(getByText('child')).toBeTruthy();
  });
});
