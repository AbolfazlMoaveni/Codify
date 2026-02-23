import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView,
  ActivityIndicator, Platform, TouchableOpacity, Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cppContent, setCppContent] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // ← Change this to your server's IP or public URL
  const API_URL = 'http://10.238.14.229:8000';

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Vazir': require('../../assets/fonts/Vazir.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,  // editing can corrupt URI on some devices
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      setCppContent('');
      setDownloadUrl(null);
      uploadImage(asset.uri, asset.mimeType);
    }
  };

  const uploadImage = async (uri: string, mimeType?: string) => {
    setIsLoading(true);

    // Determine file extension and MIME type reliably
    const uriParts = uri.split('.');
    const ext = uriParts[uriParts.length - 1].toLowerCase().split('?')[0]; // strip query params
    const resolvedMime = mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const resolvedName = `code.${ext}`;

    const formData = new FormData();
    // @ts-ignore — React Native's FormData accepts object form for file fields
    formData.append('file', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: resolvedName,
      type: resolvedMime,
    });

    try {
      const response = await fetch(`${API_URL}/ocr`, {
        method: 'POST',
        body: formData,
        // Do NOT manually set Content-Type — fetch sets it with boundary automatically
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Server error:', response.status, errText);
        Alert.alert('خطا', `سرور پاسخ داد: ${response.status}`);
        return;
      }

      const data = await response.json();
      setCppContent(data.formatted);
      setDownloadUrl(`${API_URL}${data.download_url}`);
      Alert.alert('موفقیت', 'کد با موفقیت استخراج شد!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('خطا', 'ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.title}>تبدیل عکس به کد C++</Text>
          <Text style={styles.subtitle}>تصویر دست‌نویس خود را آپلود کنید</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.buttonText}>گالری</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>در حال پردازش هوشمند...</Text>
          </View>
        )}

        {cppContent ? (
          <View style={styles.codeContainer}>
            <Text style={styles.sectionTitle}>کد استخراج شده:</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{cppContent}</Text>
            </View>
          </View>
        ) : null}

        {downloadUrl && (
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.buttonText}>دانلود فایل .cpp</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontFamily: 'Vazir', fontWeight: 'bold', color: '#2D3436' },
  subtitle: { fontSize: 14, fontFamily: 'Vazir', color: '#636E72', marginTop: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center' },
  actionButton: {
    backgroundColor: '#0984E3',
    flexDirection: 'row-reverse',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '60%',
    justifyContent: 'center',
  },
  downloadButton: {
    backgroundColor: '#00B894',
    flexDirection: 'row-reverse',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  buttonText: { color: 'white', fontFamily: 'Vazir', marginRight: 10, fontSize: 16 },
  loadingContainer: { marginTop: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, fontFamily: 'Vazir' },
  codeContainer: { marginTop: 30 },
  sectionTitle: { textAlign: 'right', fontFamily: 'Vazir', marginBottom: 10, fontWeight: 'bold' },
  codeBox: { backgroundColor: '#2D3436', padding: 15, borderRadius: 8 },
  codeText: {
    color: '#00B894',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
  },
});