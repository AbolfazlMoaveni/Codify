import { render, fireEvent } from '@testing-library/react-native';

const mockImpactAsync = jest.fn();

jest.mock('expo-haptics', () => ({
  impactAsync: (...args: unknown[]) => mockImpactAsync(...args),
  ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('@react-navigation/elements', () => {
  const { Pressable } = require('react-native');
  return {
    PlatformPressable: ({ onPressIn, children }: any) => (
      <Pressable testID="tab" onPressIn={onPressIn}>
        {children}
      </Pressable>
    ),
  };
});

import { HapticTab } from '@/components/haptic-tab';

// Compiled with EXPO_OS === 'android' under the Android Jest project.
describe('HapticTab (non-iOS)', () => {
  beforeEach(() => {
    mockImpactAsync.mockReset();
  });

  it('does not trigger haptic feedback', () => {
    const onPressIn = jest.fn();
    const { getByTestId } = render(<HapticTab onPressIn={onPressIn} {...({} as any)} />);

    fireEvent(getByTestId('tab'), 'pressIn', { nativeEvent: {} });

    expect(mockImpactAsync).not.toHaveBeenCalled();
  });

  it('still forwards the press-in event to the provided handler', () => {
    const onPressIn = jest.fn();
    const { getByTestId } = render(<HapticTab onPressIn={onPressIn} {...({} as any)} />);

    fireEvent(getByTestId('tab'), 'pressIn', { nativeEvent: {} });

    expect(onPressIn).toHaveBeenCalledTimes(1);
  });
});
