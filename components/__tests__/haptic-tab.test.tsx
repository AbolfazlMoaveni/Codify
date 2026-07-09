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

// Compiled with EXPO_OS === 'ios' under the iOS Jest project.
describe('HapticTab (iOS)', () => {
  beforeEach(() => {
    mockImpactAsync.mockReset();
  });

  it('triggers light haptic feedback on press-in', () => {
    const onPressIn = jest.fn();
    const { getByTestId } = render(<HapticTab onPressIn={onPressIn} {...({} as any)} />);

    fireEvent(getByTestId('tab'), 'pressIn', { nativeEvent: {} });

    expect(mockImpactAsync).toHaveBeenCalledWith('light');
  });

  it('forwards the press-in event to a provided handler', () => {
    const onPressIn = jest.fn();
    const { getByTestId } = render(<HapticTab onPressIn={onPressIn} {...({} as any)} />);

    fireEvent(getByTestId('tab'), 'pressIn', { nativeEvent: {} });

    expect(onPressIn).toHaveBeenCalledTimes(1);
  });

  it('does not throw when no onPressIn handler is supplied', () => {
    const { getByTestId } = render(<HapticTab {...({} as any)} />);
    expect(() => fireEvent(getByTestId('tab'), 'pressIn', { nativeEvent: {} })).not.toThrow();
  });
});
