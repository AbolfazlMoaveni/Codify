import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

const mockLaunchImageLibraryAsync = jest.fn();
const mockOpenURL = jest.fn();

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text> };
});

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: (...args: unknown[]) => mockOpenURL(...args),
}));

import UploadScreen from '@/app/(tabs)/upload';

const flushFontLoad = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe('UploadScreen', () => {
  beforeEach(() => {
    mockLaunchImageLibraryAsync.mockReset();
    mockOpenURL.mockReset();
    (global as any).fetch = jest.fn();
  });

  it('shows a loading indicator until the custom font has loaded', async () => {
    const { queryByText } = render(<UploadScreen />);
    // Before fonts resolve, only the ActivityIndicator is rendered.
    expect(queryByText('تبدیل عکس به کد')).toBeNull();
    // Flush the pending font-load effect so its state update is not left dangling.
    await flushFontLoad();
  });

  it('renders the upload UI with the default C++ output extension once fonts load', async () => {
    const { getByText } = render(<UploadScreen />);
    await flushFontLoad();

    expect(getByText('تبدیل عکس به کد')).toBeTruthy();
    // Default language is 'cpp' -> extension .cpp via EXTENSION_MAP.
    expect(getByText('خروجی: .cpp')).toBeTruthy();
    // Default OCR engine is 'vision' -> its engine note is shown.
    expect(getByText('استفاده از مدل‌های معروف هوش مصنوعی')).toBeTruthy();
  });

  it('updates the output extension when another language is selected', async () => {
    const { getByText } = render(<UploadScreen />);
    await flushFontLoad();

    fireEvent.press(getByText('Java'));
    expect(getByText('خروجی: .java')).toBeTruthy();
  });

  it('shows the AI model picker only for the Vision OCR engine', async () => {
    const { getByText, queryByText } = render(<UploadScreen />);
    await flushFontLoad();

    // Vision is selected by default, so the AI model section is visible.
    expect(getByText('مدل هوش مصنوعی')).toBeTruthy();

    // Switching to an offline engine hides the AI model picker.
    fireEvent.press(getByText('Tesseract'));
    expect(queryByText('مدل هوش مصنوعی')).toBeNull();
  });

  it('uploads a picked image and renders the returned code', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/code.png', mimeType: 'image/png' }],
    });
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        formatted: 'int main() { return 0; }',
        download_url: '/download/code.cpp',
        filename: 'code.cpp',
      }),
    });

    const { getByText } = render(<UploadScreen />);
    await flushFontLoad();

    fireEvent.press(getByText('انتخاب تصویر از گالری'));

    await waitFor(() => expect(getByText('int main() { return 0; }')).toBeTruthy());
    expect(getByText('code.cpp')).toBeTruthy();
    expect((global as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ocr'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('does nothing when image selection is canceled', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true });

    const { getByText, queryByText } = render(<UploadScreen />);
    await flushFontLoad();

    fireEvent.press(getByText('انتخاب تصویر از گالری'));

    await waitFor(() => expect(mockLaunchImageLibraryAsync).toHaveBeenCalled());
    expect((global as any).fetch).not.toHaveBeenCalled();
    expect(queryByText('کد استخراج شده')).toBeNull();
  });
});
