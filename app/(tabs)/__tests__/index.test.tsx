import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text> };
});

import HomeScreen from '@/app/(tabs)/index';

describe('HomeScreen', () => {
  it('renders the app title', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('تبدیل کد دست‌نویس به فایل قابل اجرا')).toBeTruthy();
  });

  it('renders the designer and supervisor credits', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('طراح: ابوالفضل معاونی')).toBeTruthy();
    expect(getByText('استاد راهنما: امین عنایت زارع')).toBeTruthy();
  });

  it('renders the feature description and footer', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('عملکرد')).toBeTruthy();
    expect(
      getByText('پروژه کارشناسی - دانشگاه صنعتی جندی شاپور دزفول')
    ).toBeTruthy();
  });
});
