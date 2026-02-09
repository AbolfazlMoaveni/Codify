import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, 
  ActivityIndicator, Platform, TouchableOpacity, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Font from 'expo-font';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cppContent, setCppContent] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // آدرس سرور را اینجا تنظیم کن
  const API_URL = 'http://10.238.14.229:8000'; 

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Vazir': require('../../assets/fonts/Vazir.ttf'), // مطمئن شو مسیر درست است
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setIsLoading(true);
    const formData = new FormData();
    
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    // @ts-ignore
    formData.append('file', {
      uri,
      name: `code.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      const response = await axios.post(`${API_URL}/ocr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCppContent(response.data.formatted);
      Alert.alert('موفقیت', 'کد با موفقیت استخراج شد!');
    } catch (error) {
      Alert.alert('خطا', 'ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator />;

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
  <TouchableOpacity 
    // onPress={() => Linking.openURL(downloadUrl)}
  >
    <Text style={styles.buttonText}>دانلود فایل .cpp</Text>
    <Ionicons name="download-outline" size={20} color="white" />
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
    justifyContent: 'center'
  },
  buttonText: { color: 'white', fontFamily: 'Vazir', marginRight: 10, fontSize: 16 },
  loadingContainer: { marginTop: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, fontFamily: 'Vazir' },
  codeContainer: { marginTop: 30 },
  sectionTitle: { textAlign: 'right', fontFamily: 'Vazir', marginBottom: 10, fontWeight: 'bold' },
  codeBox: { backgroundColor: '#2D3436', padding: 15, borderRadius: 8 },
  codeText: { color: '#00B894', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 14 }
});