import { render } from '@testing-library/react-native';

import { HelloWave } from '@/components/hello-wave';

describe('HelloWave', () => {
  it('renders the waving hand emoji', () => {
    const { getByText } = render(<HelloWave />);
    expect(getByText('👋')).toBeTruthy();
  });

  it('applies the expected base font size', () => {
    const { getByText } = render(<HelloWave />);
    const style = Object.assign(
      {},
      ...[getByText('👋').props.style].flat(Infinity).filter(Boolean)
    );
    expect(style.fontSize).toBe(28);
  });
});
