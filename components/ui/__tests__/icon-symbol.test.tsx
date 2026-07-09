import { render } from '@testing-library/react-native';

jest.mock('expo-symbols', () => {
  const { View } = require('react-native');
  return {
    SymbolView: ({ name, tintColor, weight, style }: any) => (
      <View testID="symbol" style={style} data-name={name} data-tint={tintColor} data-weight={weight} />
    ),
  };
});

import { IconSymbol } from '@/components/ui/icon-symbol';

const flatten = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

// On iOS the icon resolves to icon-symbol.ios.tsx, which renders an SF Symbol.
describe('IconSymbol (iOS)', () => {
  it('renders an SF Symbol using the provided name and tint color', () => {
    const { getByTestId } = render(<IconSymbol name="chevron.right" color="#123456" />);
    const symbol = getByTestId('symbol');
    expect(symbol.props['data-name']).toBe('chevron.right');
    expect(symbol.props['data-tint']).toBe('#123456');
  });

  it('defaults to the regular weight and a 24px square size', () => {
    const { getByTestId } = render(<IconSymbol name="house.fill" color="#000" />);
    const symbol = getByTestId('symbol');
    expect(symbol.props['data-weight']).toBe('regular');
    const style = flatten(symbol.props.style);
    expect(style.width).toBe(24);
    expect(style.height).toBe(24);
  });

  it('applies the requested size and weight', () => {
    const { getByTestId } = render(
      <IconSymbol name="paperplane.fill" color="#000" size={40} weight="bold" />
    );
    const symbol = getByTestId('symbol');
    expect(symbol.props['data-weight']).toBe('bold');
    expect(flatten(symbol.props.style).width).toBe(40);
  });
});
