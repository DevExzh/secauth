import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Github,
    Info,
    Lock,
    Mail,
    RefreshCw,
    Shield,
    Star,
    Users
} from 'lucide-react-native';
import React from 'react';
import {
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ContactItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function AboutAppModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  // Note: These variables are available for future use in version display
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const appVersion = '1.0.0';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const buildNumber = '2024.1';

  // Note: Features list is available for future feature showcase section
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const features: FeatureItem[] = [
    {
      icon: <Shield size={20} color={colors.primary} />,
      title: t('aboutApp.features.totp'),
      description: t('aboutApp.features.totpDescription'),
    },
    {
      icon: <Lock size={20} color={colors.primary} />,
      title: t('aboutApp.features.biometric'),
      description: t('aboutApp.features.biometricDescription'),
    },
    {
      icon: <RefreshCw size={20} color={colors.primary} />,
      title: t('aboutApp.features.cloudSync'),
      description: t('aboutApp.features.cloudSyncDescription'),
    },
    {
      icon: <Mail size={20} color={colors.primary} />,
      title: t('aboutApp.features.emailIntegration'),
      description: t('aboutApp.features.emailIntegrationDescription'),
    },
  ];

  // Note: Security features list is available for future security section
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const securityFeatures = [
    t('aboutApp.security.localStorage'),
    t('aboutApp.security.encryption'),
    t('aboutApp.security.noTracking'),
    t('aboutApp.security.openSource'),
  ];

  // Note: Contact items list is available for future contact section
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const contactItems: ContactItem[] = [
    {
      icon: <Mail size={20} color={colors.primary} />,
      title: t('aboutApp.contact.email'),
      subtitle: 'support@secauth.app',
      onPress: () => Linking.openURL('mailto:support@secauth.app'),
    },
    {
      icon: <Github size={20} color={colors.primary} />,
      title: t('aboutApp.contact.github'),
      subtitle: 'View source code',
      onPress: () => Linking.openURL('https://github.com/DevExzh/secauth'),
    },
    {
      icon: <Star size={20} color={colors.primary} />,
      title: t('aboutApp.contact.reportBug'),
      subtitle: 'Report issues or bugs',
      onPress: () => Linking.openURL('https://github.com/DevExzh/secauth/issues'),
    },
    {
      icon: <Users size={20} color={colors.primary} />,
      title: t('aboutApp.contact.requestFeature'),
      subtitle: 'Suggest new features',
      onPress: () => Linking.openURL('https://github.com/DevExzh/secauth/discussions'),
    },
  ];

  // Note: Legal items list is available for future legal section
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const legalItems = [
    {
      title: t('aboutApp.privacy'),
      onPress: () => console.log('Open privacy policy'),
    },
    {
      title: t('aboutApp.terms'),
      onPress: () => console.log('Open terms of service'),
    },
    {
      title: t('aboutApp.licenses'),
      onPress: () => console.log('Open open source licenses'),
    },
    {
      title: t('aboutApp.acknowledgments'),
      onPress: () => console.log('Open acknowledgments'),
    },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        About SecAuth
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SmartScreen style={{ backgroundColor: colors.background }}>
      {renderHeader()}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Info size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            SecAuth
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Secure two-factor authentication app
          </Text>
        </View>

        {/* Version Info */}
        <View style={styles.section}>
          <View style={[styles.versionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.versionRow}>
              <Text style={[styles.versionLabel, { color: colors.text }]}>
                Version
              </Text>
              <Text style={[styles.versionValue, { color: colors.textSecondary }]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ❤️ for secure authentication
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2024 SecAuth. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SmartScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  versionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  versionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
  },
}); 