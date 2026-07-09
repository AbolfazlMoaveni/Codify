import { render } from '@testing-library/react-native';

import { ThemedText } from '@/components/themed-text';

const mockUseThemeColor = jest.fn();

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: (...args: unknown[]) => mockUseThemeColor(...args),
}));

const flatten = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

describe('ThemedText', () => {
  beforeEach(() => {
    mockUseThemeColor.mockReset();
    mockUseThemeColor.mockReturnValue('#abcabc');
  });

  it('renders the provided text content', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies the resolved theme color', () => {
    const { getByText } = render(<ThemedText>Colored</ThemedText>);
    expect(flatten(getByText('Colored').props.style).color).toBe('#abcabc');
  });

  it('forwards light and dark color overrides to useThemeColor', () => {
    render(
      <ThemedText lightColor="#fff" darkColor="#000">
        Overridden
      </ThemedText>
    );
    expect(mockUseThemeColor).toHaveBeenCalledWith({ light: '#fff', dark: '#000' }, 'text');
  });

  it('applies title styling for the title type', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    const style = flatten(getByText('Title').props.style);
    expect(style.fontSize).toBe(32);
    expect(style.fontWeight).toBe('bold');
  });

  it('applies link styling for the link type', () => {
    const { getByText } = render(<ThemedText type="link">Link</ThemedText>);
    const style = flatten(getByText('Link').props.style);
    expect(style.color).toBe('#0a7ea4');
  });

  it('defaults to the default type styling with a 16px font size', () => {
    const { getByText } = render(<ThemedText>Default</ThemedText>);
    const style = flatten(getByText('Default').props.style);
    expect(style.fontSize).toBe(16);
    expect(style.lineHeight).toBe(24);
  });

  it('merges a custom style prop', () => {
    const { getByText } = render(<ThemedText style={{ margin: 7 }}>Styled</ThemedText>);
    expect(flatten(getByText('Styled').props.style).margin).toBe(7);
  });
});
