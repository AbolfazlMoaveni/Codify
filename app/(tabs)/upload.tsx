import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView,
  ActivityIndicator, Platform, TouchableOpacity,
  Linking, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Types

interface PillOption {
  label: string;
  value: string;
  icon?: string;
}

//  Config

// The backend base URL is read from the EXPO_PUBLIC_API_URL environment
// variable so it is never hardcoded in the source. Prefer an https:// URL in
// production so uploaded images and returned code are transmitted encrypted.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// Allowed image MIME types and max upload size for basic client-side validation.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const LANGUAGES: PillOption[] = [
  { label: 'C',    value: 'c',          icon: 'code-slash'     },
  { label: 'C++',  value: 'cpp',        icon: 'code-slash'     },
  { label: 'C#',   value: 'csharp',     icon: 'code-slash'     },
  { label: 'Java', value: 'java',       icon: 'cafe'           },
  { label: 'JS',   value: 'javascript', icon: 'logo-javascript'},
  { label: 'PHP',  value: 'php',        icon: 'server'         },
];

const OCR_ENGINES: PillOption[] = [
  { label: 'Vision AI',  value: 'vision',    icon: 'eye'       },
  { label: 'Tesseract',  value: 'tesseract', icon: 'layers'    },
  { label: 'PaddleOCR',  value: 'paddleocr', icon: 'boat'      },
  { label: 'EasyOCR',    value: 'easyocr',   icon: 'scan'      },
  { label: 'TrOCR',      value: 'trocr',     icon: 'text'      },
];

const AI_MODELS: PillOption[] = [
  { label: 'Groq',   value: 'groq',   icon: 'flash'    },
  { label: 'Gemini', value: 'gemini', icon: 'planet'   },
  { label: 'GPT-4o', value: 'openai', icon: 'sparkles' },
  { label: 'Eboo', value: 'eboo', icon: 'eye' },
];

const EXTENSION_MAP: Record<string, string> = {
  c: 'c', cpp: 'cpp', csharp: 'cs',
  java: 'java', javascript: 'js', php: 'php',
};

const ENGINE_NOTES: Record<string, string> = {
  vision:    'استفاده از مدل‌های معروف هوش مصنوعی',
  tesseract: 'آفلاین — Tesseract 5 LSTM',
  paddleocr: 'آفلاین — PaddleOCR',
  easyocr:   'آفلاین',
  trocr:     'آفلاین',
};

// Pill Selector

function PillSelector({
  options, selected, onSelect, accentColor = '#0984E3',
}: {
  options: PillOption[];
  selected: string;
  onSelect: (v: string) => void;
  accentColor?: string;
}) {
  return (
    <FlatList
      data={options}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.value}
      contentContainerStyle={styles.pillRow}
      renderItem={({ item }) => {
        const active = item.value === selected;
        return (
          <TouchableOpacity
            style={[
              styles.pill,
              active && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.75}
          >
            {item.icon && (
              <Ionicons
                name={item.icon as any}
                size={14}
                color={active ? '#fff' : '#636E72'}
                style={{ marginRight: 5 }}
              />
            )}
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

// Header

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionLabelWrap}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
    </View>
  );
}

// Main Screen

export default function UploadScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded,    setFontsLoaded]    = useState(false);
  const [language,       setLanguage]       = useState('cpp');
  const [ocrEngine,      setOcrEngine]      = useState('vision');
  const [aiModel,        setAiModel]        = useState('groq');
  const [isLoading,      setIsLoading]      = useState(false);
  const [cppContent,     setCppContent]     = useState('');
  const [downloadUrl,    setDownloadUrl]    = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  useEffect(() => {
    Font.loadAsync({ 'Vazir': require('../../assets/fonts/Vazir.ttf') })
      .catch((error) => {
        // Fall back to the system font instead of blocking the UI forever.
        console.error('Font load error:', error);
      })
      .finally(() => setFontsLoaded(true));
  }, []);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('خطا', 'دسترسی به گالری داده نشد');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        if (asset.mimeType && !ALLOWED_IMAGE_TYPES.includes(asset.mimeType.toLowerCase())) {
          Alert.alert('خطا', 'فرمت تصویر پشتیبانی نمی‌شود');
          return;
        }
        if (typeof asset.fileSize === 'number' && asset.fileSize > MAX_UPLOAD_BYTES) {
          Alert.alert('خطا', 'حجم تصویر بیش از حد مجاز است (حداکثر ۱۰ مگابایت)');
          return;
        }

        setCppContent('');
        setDownloadUrl(null);
        uploadImage(asset.uri, asset.mimeType);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('خطا', 'انتخاب تصویر ناموفق بود');
    }
  };

  const uploadImage = async (uri: string, mimeType?: string | null) => {
    if (!API_URL) {
      Alert.alert('خطا', 'آدرس سرور تنظیم نشده است (EXPO_PUBLIC_API_URL)');
      return;
    }
    if (!/^https:\/\//i.test(API_URL) && !__DEV__) {
      Alert.alert('خطا', 'ارتباط ناامن است؛ لطفاً از آدرس https استفاده کنید');
      return;
    }

    setIsLoading(true);

    const ext          = uri.split('.').pop()?.toLowerCase().split('?')[0] ?? 'jpg';
    const resolvedMime = mimeType ?? `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const cleanUri     = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', { uri: cleanUri, name: `code.${ext}`, type: resolvedMime });
    formData.append('language',   language);
    formData.append('ai_model',   aiModel);
    formData.append('ocr_engine', ocrEngine);

    try {
      const response = await fetch(`${API_URL}/ocr`, { method: 'POST', body: formData });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Server error:', response.status, errText);
        Alert.alert('خطا', `سرور پاسخ داد: ${response.status}`);
        return;
      }

      const data = await response.json();
      if (!data || typeof data.formatted !== 'string') {
        console.error('Unexpected server response:', data);
        Alert.alert('خطا', 'پاسخ سرور نامعتبر بود');
        return;
      }

      setCppContent(data.formatted);
      setDownloadUrl(data.download_url ? `${API_URL}${data.download_url}` : null);
      setOutputFilename(data.filename ?? '');
      Alert.alert('موفقیت', 'کد با موفقیت استخراج شد!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('خطا', 'ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    try {
      const supported = await Linking.canOpenURL(downloadUrl);
      if (!supported) {
        Alert.alert('خطا', 'امکان باز کردن لینک دانلود وجود ندارد');
        return;
      }
      await Linking.openURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('خطا', 'دانلود فایل ناموفق بود');
    }
  };

  if (!fontsLoaded) return <ActivityIndicator style={{ flex: 1 }} />;

  const showAiModelPicker = ocrEngine === 'vision';
  const ext = EXTENSION_MAP[language] ?? 'txt';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>تبدیل عکس به کد</Text>
          <Text style={styles.subtitle}>تصویر دست‌نویس خود را آپلود کنید</Text>
        </View>

        {/* Language */}
        <View style={styles.card}>
          <SectionLabel title="زبان برنامه‌نویسی" subtitle={`خروجی: .${ext}`} />
          <PillSelector
            options={LANGUAGES}
            selected={language}
            onSelect={setLanguage}
            accentColor="#0984E3"
          />
        </View>

        {/* OCR Engine */}
        <View style={styles.card}>
          <SectionLabel title="موتور OCR" subtitle={ENGINE_NOTES[ocrEngine]} />
          <PillSelector
            options={OCR_ENGINES}
            selected={ocrEngine}
            onSelect={setOcrEngine}
            accentColor="#6C5CE7"
          />
        </View>

        {/* AI Vision */}
        {showAiModelPicker && (
          <View style={styles.card}>
            <SectionLabel title="مدل هوش مصنوعی" subtitle="انتخاب سرویس Vision AI" />
            <PillSelector
              options={AI_MODELS}
              selected={aiModel}
              onSelect={setAiModel}
              accentColor="#00B894"
            />
          </View>
        )}

        {/* Upload button */}
        <TouchableOpacity
          style={[styles.uploadButton, isLoading && { opacity: 0.6 }]}
          onPress={pickImage}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Ionicons name="image-outline" size={22} color="white" style={{ marginLeft: 8 }} />
          <Text style={styles.uploadButtonText}>انتخاب تصویر از گالری</Text>
        </TouchableOpacity>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0984E3" />
            <Text style={styles.loadingText}>در حال پردازش هوشمند...</Text>
          </View>
        )}

        {/* Code output */}
        {cppContent ? (
          <View style={styles.card}>
            <View style={styles.codeHeader}>
              <Text style={styles.sectionLabel}>کد استخراج شده</Text>
              <Text style={styles.codeFilename}>{outputFilename}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{cppContent}</Text>
              </View>
            </ScrollView>
          </View>
        ) : null}

        {/* Download button */}
        {downloadUrl && (
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={20} color="white" style={{ marginLeft: 8 }} />
            <Text style={styles.uploadButtonText}>دانلود فایل .{ext}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  scroll:    { padding: 20 },

  header:   { alignItems: 'center', marginBottom: 24 },
  title:    { fontSize: 22, fontFamily: 'Vazir', fontWeight: 'bold', color: '#2D3436' },
  subtitle: { fontSize: 13, fontFamily: 'Vazir', color: '#636E72', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionLabelWrap: { marginBottom: 12 },
  sectionLabel: {
    fontFamily: 'Vazir', fontWeight: 'bold',
    fontSize: 14, color: '#2D3436', textAlign: 'right',
  },
  sectionSub: {
    fontFamily: 'Vazir', fontSize: 11,
    color: '#B2BEC3', textAlign: 'right', marginTop: 2,
  },

  pillRow: { paddingBottom: 2, gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    backgroundColor: '#F8F9FA',
  },
  pillText:       { fontFamily: 'Vazir', fontSize: 13, color: '#636E72' },
  pillTextActive: { color: '#fff', fontWeight: 'bold' },

  uploadButton: {
    backgroundColor: '#0984E3',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#0984E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonText: { color: '#fff', fontFamily: 'Vazir', fontSize: 16, fontWeight: 'bold' },

  loadingBox:  { alignItems: 'center', paddingVertical: 30 },
  loadingText: { marginTop: 12, fontFamily: 'Vazir', color: '#636E72' },

  codeHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeFilename: { fontFamily: 'Vazir', fontSize: 11, color: '#B2BEC3' },
  codeBox: { backgroundColor: '#1E272E', padding: 14, borderRadius: 10 },
  codeText: {
    color: '#55EFC4',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },

  downloadButton: {
    backgroundColor: '#00B894',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});