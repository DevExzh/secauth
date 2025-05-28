import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { EmailService } from '@/services/emailService';
import {
    ArrowLeft,
    Mail,
    Shield,
    Trash2
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface EmailIntegrationScreenProps {
  onBack: () => void;
  onGrantAccess: () => void;
}

export const EmailIntegrationScreen: React.FC<EmailIntegrationScreenProps> = ({ 
  onBack, 
  onGrantAccess 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [isGranting, setIsGranting] = useState(false);
  const [permissions, setPermissions] = useState({
    accessInbox: false,
    deleteProcessed: false,
    secureConnection: true,
  });

  const handleGrantAccess = async () => {
    setIsGranting(true);
    try {
      const granted = await EmailService.requestEmailPermissions();
      if (granted) {
        // 直接调用 onGrantAccess，不显示 Alert
        onGrantAccess();
      } else {
        Alert.alert(t('emailIntegration.alerts.permissionDenied'), t('emailIntegration.alerts.permissionDeniedMessage'));
        setIsGranting(false);
      }
    } catch (error) {
      Alert.alert(t('emailIntegration.alerts.error'), t('emailIntegration.alerts.errorMessage'));
      setIsGranting(false);
    }
    // 注意：如果成功，不在这里设置 setIsGranting(false)，因为会切换到下一个屏幕
  };

  const permissionItems = [
    {
      icon: <Mail size={24} color={colors.primary} />,
      title: 'Access Email Inbox',
      description: 'Read and parse emails for account information',
      granted: permissions.accessInbox,
    },
    {
      icon: <Trash2 size={24} color={colors.primary} />,
      title: 'Delete Processed Emails',
      description: 'Delete processed emails after extracting information',
      granted: permissions.deleteProcessed,
    },
    {
      icon: <Shield size={24} color={colors.primary} />,
      title: 'Secure Connection',
      description: 'Active',
      granted: permissions.secureConnection,
      isStatus: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Email Integration
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            Grant Access to Your Email
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            To automatically extract account information from your emails, we need your permission to access your inbox. This will allow us to identify and display relevant account details for your security.
          </Text>
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Permissions
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
                    <View style={styles.statusContainer}>
                      <Text style={[styles.statusText, { color: colors.primary }]}>
                        Active
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
            style={[styles.grantButton, { backgroundColor: colors.primary }]}
            onPress={handleGrantAccess}
            disabled={isGranting}
          >
            <Text style={[styles.grantButtonText, { color: colors.background }]}>
              {isGranting ? 'Granting Access...' : 'Grant Access'}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
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