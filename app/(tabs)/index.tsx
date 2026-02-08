import { Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="code-slash" size={64} color="#007AFF" />
        <Text style={styles.title}>Image to CPP Converter</Text>
        <Text style={styles.subtitle}>
          Convert images to C++ code with AI-powered analysis
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureCard}>
          <Ionicons name="image-outline" size={32} color="#007AFF" />
          <Text style={styles.featureTitle}>Image Upload</Text>
          <Text style={styles.featureDescription}>
            Upload images from gallery or take photos with camera
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="server-outline" size={32} color="#34C759" />
          <Text style={styles.featureTitle}>AI Processing</Text>
          <Text style={styles.featureDescription}>
            Server processes images and generates optimized C++ code
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="document-text-outline" size={32} color="#FF9500" />
          <Text style={styles.featureTitle}>Code Preview</Text>
          <Text style={styles.featureDescription}>
            View and copy generated C++ code with syntax highlighting
          </Text>
        </View>
      </View>

      <Link href="/(tabs)/upload" asChild>
        <TouchableOpacity style={styles.ctaButton}>
          <Ionicons name="rocket-outline" size={24} color="white" />
          <Text style={styles.ctaText}>Start Converting</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ using Expo + FastAPI</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});