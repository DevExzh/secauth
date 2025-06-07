import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  Shield,
  Trash2
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface EmailConfig {
  email: string;
  password: string;
  protocol: 'IMAP' | 'POP3';
  imapServer: string;
  imapPort: string;
  smtpServer: string;
  smtpPort: string;
  useSsl: boolean;
}

export default function EmailIntegrationModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  const [isGranting, setIsGranting] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);

  // Parse emailConfig from params if available
  const emailConfig: EmailConfig | undefined = params.emailConfig 
    ? JSON.parse(params.emailConfig as string) 
    : undefined;

  const handleGrantAccess = async () => {
    setIsGranting(true);
    setConnectionStep(0);
    
    try {
      // 模拟连接步骤
      const steps = [
        t('emailIntegration.steps.testing'),
        t('emailIntegration.steps.authenticating'),
        t('emailIntegration.steps.verifying'),
        t('emailIntegration.steps.establishing'),
        t('emailIntegration.steps.success')
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setConnectionStep(i);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Navigate to parsing screen
      if (emailConfig?.email) {
        router.push({
          pathname: '/modals/email/email-parsing',
          params: {
            userEmail: emailConfig.email
          }
        } as any);
      } else {
        router.push('/modals/email/email-parsing' as any);
      }
    } catch (error) {
      console.error('Email integration error:', error);
      Alert.alert(t('emailIntegration.alerts.error'), t('emailIntegration.alerts.errorMessage'));
      setIsGranting(false);
    }
  };

  const connectionSteps = [
    t('emailIntegration.steps.testing'),
    t('emailIntegration.steps.authenticating'),
    t('emailIntegration.steps.verifying'),
    t('emailIntegration.steps.establishing'),
    t('emailIntegration.steps.success')
  ];

  const permissionItems = [
    {
      icon: <Mail size={24} color={colors.primary} />,
      title: t('emailIntegration.permissions.accessInbox'),
      description: t('emailIntegration.permissions.accessInboxDesc'),
      granted: true,
    },
    {
      icon: <Trash2 size={24} color={colors.primary} />,
      title: t('emailIntegration.permissions.deleteProcessed'),
      description: t('emailIntegration.permissions.deleteProcessedDesc'),
      granted: false,
    },
    {
      icon: <Shield size={24} color={colors.primary} />,
      title: t('emailIntegration.permissions.secureConnection'),
      description: emailConfig?.useSsl ? t('emailIntegration.permissions.sslEnabled') : t('emailIntegration.permissions.sslDisabled'),
      granted: emailConfig?.useSsl || false,
      isStatus: true,
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {t('emailIntegration.title')}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SmartScreen style={{ backgroundColor: colors.background }}>
      {renderHeader()}
      <ScrollView style={styles.content}>
        {/* Email Configuration Summary */}
        {emailConfig && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('emailIntegration.configSummary')}
            </Text>
            <View style={[styles.configContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.configItem}>
                <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                  {t('emailIntegration.email')}
                </Text>
                <Text style={[styles.configValue, { color: colors.text }]}>
                  {emailConfig.email}
                </Text>
              </View>
              <View style={styles.configItem}>
                <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                  {t('emailIntegration.protocol')}
                </Text>
                <Text style={[styles.configValue, { color: colors.text }]}>
                  {emailConfig.protocol}
                </Text>
              </View>
              <View style={styles.configItem}>
                <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                  {t('emailIntegration.server')}
                </Text>
                <Text style={[styles.configValue, { color: colors.text }]}>
                  {emailConfig.imapServer}:{emailConfig.imapPort}
                </Text>
              </View>
              <View style={styles.configItem}>
                <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                  {t('emailIntegration.encryption')}
                </Text>
                <Text style={[styles.configValue, { color: colors.text }]}>
                  {emailConfig.useSsl ? 'SSL/TLS' : t('emailIntegration.noEncryption')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Connection Progress */}
        {isGranting && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('emailIntegration.connectionProgress')}
            </Text>
            <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {connectionSteps[connectionStep]}
              </Text>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${((connectionStep + 1) / connectionSteps.length) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('emailIntegration.grantAccessTitle')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('emailIntegration.grantAccessDesc')}
          </Text>
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('emailIntegration.permissionsTitle')}
          </Text>
          <View style={[styles.permissionsContainer, { backgroundColor: colors.surface }]}>
            {permissionItems.map((item, index) => (
              <View key={item.title}>
                <View style={styles.permissionItem}>
                  <View style={styles.permissionIcon}>
                    {item.icon}
                  </View>
                  <View style={styles.permissionContent}>
                    <Text style={[styles.permissionTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                  {item.isStatus && (
                    <View style={[
                      styles.statusContainer,
                      { backgroundColor: item.granted ? 'rgba(0, 122, 255, 0.1)' : 'rgba(255, 149, 0, 0.1)' }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: item.granted ? colors.primary : '#FF9500' }
                      ]}>
                        {item.granted ? t('emailIntegration.active') : t('emailIntegration.inactive')}
                      </Text>
                    </View>
                  )}
                </View>
                {index < permissionItems.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Grant Access Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.grantButton, 
              { 
                backgroundColor: isGranting ? colors.border : colors.primary,
                opacity: isGranting ? 0.7 : 1
              }
            ]}
            onPress={handleGrantAccess}
            disabled={isGranting}
          >
            <Text style={[styles.grantButtonText, { color: colors.background }]}>
              {isGranting ? t('emailIntegration.connecting') : t('emailIntegration.grantAccess')}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  configContainer: {
    borderRadius: 12,
    padding: 16,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    borderRadius: 12,
    padding: 16,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  titleSection: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  permissionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  buttonContainer: {
    paddingVertical: 24,
  },
  grantButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grantButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 