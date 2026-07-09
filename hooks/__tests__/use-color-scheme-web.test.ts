import { renderHook } from '@testing-library/react-native';

// Import the web implementation explicitly so it can be unit tested with the
// native react-test-renderer regardless of the active platform project.
import { useColorScheme } from '@/hooks/use-color-scheme.web';

const mockRNColorScheme = jest.fn();

jest.mock('react-native', () => ({
  useColorScheme: () => mockRNColorScheme(),
}));

// When true, the hydration `useEffect` is turned into a no-op so the
// pre-hydration branch (which returns 'light') can be exercised. A Proxy is
// used instead of spreading `...actual` because React 19's non-enumerable
// internals would otherwise be dropped and break the hooks dispatcher.
let mockSkipHydrationEffect = false;
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return new Proxy(actual, {
    get(target, prop, receiver) {
      if (prop === 'useEffect' && mockSkipHydrationEffect) {
        return () => {};
      }
      return Reflect.get(target, prop, receiver);
    },
  });
});

describe('useColorScheme (web)', () => {
  beforeEach(() => {
    mockRNColorScheme.mockReset();
    mockSkipHydrationEffect = false;
  });

  it('returns the native color scheme once the component has hydrated', () => {
    mockRNColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe('dark');
  });

  it('returns "light" before hydration to support static rendering', () => {
    mockRNColorScheme.mockReturnValue('dark');
    mockSkipHydrationEffect = true;
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe('light');
  });
});
