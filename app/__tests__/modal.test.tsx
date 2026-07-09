import { render } from '@testing-library/react-native';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#333333',
}));

jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    Link: ({ children }: any) => <Text>{children}</Text>,
  };
});

import ModalScreen from '@/app/modal';

describe('ModalScreen', () => {
  it('renders the modal heading', () => {
    const { getByText } = render(<ModalScreen />);
    expect(getByText('This is a modal')).toBeTruthy();
  });

  it('renders a link back to the home screen', () => {
    const { getByText } = render(<ModalScreen />);
    expect(getByText('Go to home screen')).toBeTruthy();
  });
});
