import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  const Tabs = ({ children }: any) => <View testID="tabs">{children}</View>;
  Tabs.Screen = ({ name, options }: any) => {
    // Exercise the tabBarIcon render prop so its branch is covered.
    const icon = options?.tabBarIcon?.({ color: '#000', size: 24, focused: false });
    return (
      <View testID={`tab-${name}`} accessibilityLabel={options?.title}>
        {icon}
      </View>
    );
  };
  return { Tabs };
});

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text> };
});

import TabLayout from '@/app/(tabs)/_layout';

describe('TabLayout', () => {
  it('registers the home and upload tabs with their titles', () => {
    const { getByTestId } = render(<TabLayout />);
    expect(getByTestId('tabs')).toBeTruthy();
    expect(getByTestId('tab-index').props.accessibilityLabel).toBe('خانه');
    expect(getByTestId('tab-upload').props.accessibilityLabel).toBe('آپلود');
  });

  it('renders the configured tab bar icons', () => {
    const { getByText } = render(<TabLayout />);
    expect(getByText('icon:home-outline')).toBeTruthy();
    expect(getByText('icon:cloud-upload-outline')).toBeTruthy();
  });
});
