import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// Define types
interface CppFileResponse {
  filename: string;
  content: string;
}

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cppContent, setCppContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  // Update this with your server URL
  const API_URL = 'http://YOUR_SERVER_IP:8000'; // Change to your server IP

  const pickImage = async () => {
    try {
      // Request permissions
      if (Platform.OS === 'web') {
        // For web, use standard file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (event: Event) => {
          const target = event.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            const file = target.files[0];
            const reader = new FileReader();
            
            reader.onloadend = () => {
              const base64 = reader.result as string;
              setSelectedImage(base64);
              uploadImage(base64, file.name);
            };
            
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      } else {
        // For mobile devices
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.status !== 'granted') {
          Alert.alert('Permission Required', 'We need camera roll permissions to select images!');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
          base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
          setSelectedImage(base64Image);
          uploadImage(base64Image, 'image.jpg');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera permissions to take photos!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setSelectedImage(base64Image);
        uploadImage(base64Image, 'camera_photo.jpg');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (base64Image: string, originalFileName: string) => {
    if (!base64Image) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    setIsLoading(true);
    setCppContent('');
    setFileName('');

    try {
      // Prepare form data
      const formData = new FormData();
      
      // Convert base64 to blob
      const base64Data = base64Image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Append image to form data
      formData.append('image', blob, originalFileName);

      // Send to FastAPI server
      const response = await axios.post(`${API_URL}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'json',
      });

      // Handle response
      if (response.data && response.data.filename && response.data.content) {
        const data: CppFileResponse = response.data;
        setCppContent(data.content);
        setFileName(data.filename);
        Alert.alert('Success', 'CPP file generated successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || error.message || 'Failed to upload image'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setCppContent('');
    setFileName('');
  };

  const copyToClipboard = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(cppContent);
      Alert.alert('Copied', 'CPP code copied to clipboard!');
    } else {
      // For mobile, you might want to use expo-clipboard
      Alert.alert('Info', 'Copy functionality on mobile requires additional setup');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Image to CPP Converter</Text>
          <Text style={styles.subtitle}>Upload an image to generate C++ code</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={pickImage}
            disabled={isLoading}
          >
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Pick Image</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.cameraButton]}
            onPress={takePhoto}
            disabled={isLoading}
          >
            <Ionicons name="camera-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {selectedImage && !isLoading && (
          <View style={styles.imageContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selected Image</Text>
              <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.imageWrapper}>
              <img 
                src={selectedImage} 
                alt="Selected" 
                style={styles.image}
              />
            </View>
          </View>
        )}

        {cppContent && (
          <View style={styles.cppContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Generated C++ Code</Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={20} color="#007AFF" />
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>
            
            {fileName && (
              <View style={styles.fileNameContainer}>
                <Ionicons name="document-text-outline" size={16} color="#007AFF" />
                <Text style={styles.fileName}>{fileName}</Text>
              </View>
            )}

            <View style={styles.codeContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <ScrollView 
                  style={styles.codeScrollView}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={styles.codeText}>{cppContent}</Text>
                </ScrollView>
              </ScrollView>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Lines</Text>
                <Text style={styles.statValue}>{cppContent.split('\n').length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Characters</Text>
                <Text style={styles.statValue}>{cppContent.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>File Size</Text>
                <Text style={styles.statValue}>
                  {(new TextEncoder().encode(cppContent).length / 1024).toFixed(2)} KB
                </Text>
              </View>
            </View>
          </View>
        )}

        {!selectedImage && !cppContent && !isLoading && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="code-slash-outline" size={80} color="#E0E0E0" />
            <Text style={styles.placeholderText}>
              Select an image or take a photo to generate C++ code
            </Text>
            <Text style={styles.placeholderSubtext}>
              Supports JPG, PNG, and other common image formats
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    maxWidth: 150,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButton: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  imageContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  clearText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  imageWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    objectFit: 'cover',
  },
  cppContainer: {
    marginTop: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  copyText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  fileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  codeContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  codeScrollView: {
    maxHeight: 350,
  },
  codeText: {
    fontFamily: Platform.OS === 'web' ? 'Consolas, Monaco, "Courier New", monospace' : 'monospace',
    fontSize: 13,
    color: '#D4D4D4',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
    fontWeight: '600',
    lineHeight: 24,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 20,
  },
});