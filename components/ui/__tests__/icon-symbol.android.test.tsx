import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { Text } = require('react-native');
  return ({ name, size, color, style }: any) => (
    <Text testID="material-icon" style={style} data-size={size} data-color={color}>
      {name}
    </Text>
  );
});

import { IconSymbol } from '@/components/ui/icon-symbol';

// On Android the icon resolves to icon-symbol.tsx, the Material Icons fallback.
describe('IconSymbol (Material Icons fallback)', () => {
  it('maps an SF Symbol name to its Material Icons equivalent', () => {
    const { getByTestId } = render(<IconSymbol name="chevron.right" color="#000" />);
    expect(getByTestId('material-icon')).toHaveTextContent('chevron-right');
  });

  it('maps the house symbol to the home material icon', () => {
    const { getByTestId } = render(<IconSymbol name="house.fill" color="#000" />);
    expect(getByTestId('material-icon')).toHaveTextContent('home');
  });

  it('maps the code symbol to the code material icon', () => {
    const { getByTestId } = render(
      <IconSymbol name="chevron.left.forwardslash.chevron.right" color="#000" />
    );
    expect(getByTestId('material-icon')).toHaveTextContent('code');
  });

  it('passes through the provided size and color props', () => {
    const { getByTestId } = render(
      <IconSymbol name="paperplane.fill" color="#ff0000" size={42} />
    );
    const icon = getByTestId('material-icon');
    expect(icon.props['data-size']).toBe(42);
    expect(icon.props['data-color']).toBe('#ff0000');
  });
});
