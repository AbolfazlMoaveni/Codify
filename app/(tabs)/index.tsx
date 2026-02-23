import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/icon-symbol';
// import jsulogo from '../../assets/images/jsu.svg'
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.header}>
        {/* <img src={jsulogo} alt="jsulogo"/> */}
        <Ionicons name="code-slash" size={64} color="#007AFF" />
        <Text style={styles.title}>تبدیل کد دست‌نویس به فایل قابل اجرا</Text>
        <Text style={styles.subtitle}>
          طراح: ابوالفضل معاونی
        </Text>
        <Text style={styles.subtitle}>
          استاد راهنما: امین عنایت زارع
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureCard}>
          <Ionicons name="image-outline" size={32} color="#007AFF" />
          <Text style={styles.featureTitle}>نحوه کار</Text>
          <Text style={styles.featureDescription}>
            تصویر خود را در سکشن آپلود، بارگذاری کنید و منتظر پاسخ بمانید
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="server-outline" size={32} color="#34C759" />
          <Text style={styles.featureTitle}>مدل OCR</Text>
          <Text style={styles.featureDescription}>
            سرور به کمک Microsoft TrOCR و Post-processing کد مناسب را دریافت و سپس به کمک یک API Call به یک مدل هوش مصنوعی، از لحاظ سینتکس آن را بررسی و خطایابی میکند و نتیجه را باز میگرداند
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>پروژه کارشناسی - دانشگاه صنعتی جندی شاپور دزفول</Text>
      </View>
</ScrollView>
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
    fontFamily: 'Vazir',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Vazir',
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
    fontFamily: 'Vazir',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Vazir',
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
    fontFamily: 'Vazir',
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Vazir',
    color: '#C7C7CC',
    textAlign: 'center',
  },
});