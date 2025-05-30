import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
    ArrowLeft,
    ChevronRight,
    ExternalLink,
    Github,
    Info,
    Lock,
    Mail,
    RefreshCw,
    Shield,
    Star,
    Users,
} from 'lucide-react-native';
import React from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AboutAppScreenProps {
  onBack: () => void;
}

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

export const AboutAppScreen: React.FC<AboutAppScreenProps> = ({
  onBack,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const appVersion = '1.0.0';
  const buildNumber = '2024.1';

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

  const securityFeatures = [
    t('aboutApp.security.localStorage'),
    t('aboutApp.security.encryption'),
    t('aboutApp.security.noTracking'),
    t('aboutApp.security.openSource'),
  ];

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('aboutApp.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Info size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            SecAuth
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('aboutApp.description')}
          </Text>
        </View>

        {/* Version Info */}
        <View style={styles.section}>
          <View style={[styles.versionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.versionRow}>
              <Text style={[styles.versionLabel, { color: colors.text }]}>
                {t('aboutApp.version')}
              </Text>
              <Text style={[styles.versionValue, { color: colors.textSecondary }]}>
                {appVersion}
              </Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <View style={styles.versionRow}>
              <Text style={[styles.versionLabel, { color: colors.text }]}>
                {t('aboutApp.buildNumber')}
              </Text>
              <Text style={[styles.versionValue, { color: colors.textSecondary }]}>
                {buildNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('aboutApp.features.title')}
          </Text>
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View
                key={feature.title}
                style={[styles.featureCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    {feature.icon}
                  </View>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {feature.title}
                  </Text>
                </View>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Security & Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('aboutApp.security.title')}
          </Text>
          <View style={[styles.securityCard, { backgroundColor: colors.surface }]}>
            {securityFeatures.map((feature, index) => (
              <View key={index} style={styles.securityItem}>
                <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                  • {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('aboutApp.contact.title')}
          </Text>
          <View style={[styles.contactContainer, { backgroundColor: colors.surface }]}>
            {contactItems.map((item, index) => (
              <View key={item.title}>
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={item.onPress}
                >
                  <View style={styles.contactIcon}>
                    {item.icon}
                  </View>
                  <View style={styles.contactContent}>
                    <Text style={[styles.contactTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <ExternalLink size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {index < contactItems.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Legal
          </Text>
          <View style={[styles.legalContainer, { backgroundColor: colors.surface }]}>
            {legalItems.map((item, index) => (
              <View key={item.title}>
                <TouchableOpacity
                  style={styles.legalItem}
                  onPress={item.onPress}
                >
                  <Text style={[styles.legalTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {index < legalItems.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  securityCard: {
    borderRadius: 12,
    padding: 16,
  },
  securityItem: {
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
  },
  legalContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginLeft: 16,
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
}); 