import { ConnectedAccountsScreen } from '@/components/ConnectedAccountsScreen';
import { EmailIntegrationScreen } from '@/components/EmailIntegrationScreen';
import { EmailParsingScreen } from '@/components/EmailParsingScreen';
import { EmailSettingsScreen } from '@/components/EmailSettingsScreen';
import { SyncFrequencyModal } from '@/components/SyncFrequencyModal';
import CloudSyncStaticScreen from '@/components/ui/CloudSyncStaticScreen';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { Account } from '@/types/auth';
import {
  Bell,
  ChevronRight,
  Clock,
  Download,
  Globe,
  HelpCircle,
  Info,
  Link,
  Lock,
  Mail,
  MailCheck,
  Moon,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  Upload,
  User,
  Wifi,
} from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [darkMode, setDarkMode] = React.useState(colorScheme === 'dark');
  const [notifications, setNotifications] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);
  const [showEmailIntegration, setShowEmailIntegration] = React.useState(false);
  const [showEmailParsing, setShowEmailParsing] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [showEmailSettings, setShowEmailSettings] = React.useState(false);
  const [showConnectedAccounts, setShowConnectedAccounts] = React.useState(false);
  const [showSyncFrequency, setShowSyncFrequency] = React.useState(false);
  const [showCloudSync, setShowCloudSync] = React.useState(false);
  const [emailAutoSync, setEmailAutoSync] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [autoDeleteEmails, setAutoDeleteEmails] = React.useState(true);
  const [emailSyncFrequency, setEmailSyncFrequency] = React.useState(t('emailSettings.syncFrequency'));
  const [connectedEmailAccounts] = React.useState(2); // Mock connected accounts count
  
  // 旋转动画
  const spinValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (isScanning) {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();
    }
  }, [isScanning, spinValue]);
  
  const settingsGroups = [
    {
      title: t('profile.security'),
      items: [
        {
          icon: <Lock size={20} color={colors.primary} />,
          title: t('settings.biometricUnlock'),
          subtitle: t('settings.biometricDescription'),
          type: 'switch',
          value: biometric,
          onToggle: setBiometric,
        },
        {
          icon: <Shield size={20} color={colors.primary} />,
          title: t('settings.autoLock'),
          subtitle: t('settings.autoLockDescription'),
          type: 'navigation',
        },
      ],
    },
    {
      title: t('profile.preferences'),
      items: [
        {
          icon: <Globe size={20} color={colors.primary} />,
          title: t('settings.language'),
          subtitle: '',
          type: 'language',
        },
        {
          icon: <Moon size={20} color={colors.primary} />,
          title: t('settings.theme'),
          subtitle: t('settings.themeDescription'),
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: <Bell size={20} color={colors.primary} />,
          title: t('settings.notifications'),
          subtitle: t('settings.notificationsDescription'),
          type: 'switch',
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: t('profile.emailSettings'),
      items: [
        {
          icon: <Mail size={20} color={colors.primary} />,
          title: t('settings.emailIntegration'),
          subtitle: t('settings.emailIntegrationDescription'),
          type: 'navigation',
          onPress: () => setShowEmailSettings(true),
        },
        {
          icon: <Link size={20} color={colors.primary} />,
          title: t('settings.connectedAccounts'),
          subtitle: `${connectedEmailAccounts} ${t('settings.connectedAccountsDescription')}`,
          type: 'navigation',
          onPress: () => setShowConnectedAccounts(true),
        },
        {
          icon: <RefreshCw size={20} color={colors.primary} />,
          title: t('settings.autoSync'),
          subtitle: t('settings.autoSyncDescription'),
          type: 'switch',
          value: emailAutoSync,
          onToggle: setEmailAutoSync,
        },
        {
          icon: <Clock size={20} color={colors.primary} />,
          title: t('settings.syncFrequency'),
          subtitle: t('settings.syncFrequencyDescription'),
          type: 'navigation',
          onPress: () => setShowSyncFrequency(true),
        },
        {
          icon: <Trash2 size={20} color={colors.primary} />,
          title: t('settings.autoDeleteEmails'),
          subtitle: t('settings.autoDeleteEmailsDescription'),
          type: 'switch',
          value: autoDeleteEmails,
          onToggle: setAutoDeleteEmails,
        },
        {
          icon: <MailCheck size={20} color={colors.primary} />,
          title: t('settings.emailNotifications'),
          subtitle: t('settings.emailNotificationsDescription'),
          type: 'switch',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
      ],
    },
    {
      title: t('profile.dataManagement'),
      items: [
        {
          icon: <Upload size={20} color={colors.primary} />,
          title: t('settings.exportData'),
          subtitle: t('settings.exportDataDescription'),
          type: 'navigation',
          onPress: () => console.log('Export Data'),
        },
        {
          icon: <Download size={20} color={colors.primary} />,
          title: t('settings.importData'),
          subtitle: t('settings.importDataDescription'),
          type: 'navigation',
          onPress: () => console.log('Import Data'),
        },
        {
          icon: <Wifi size={20} color={colors.primary} />,
          title: t('settings.cloudSync'),
          subtitle: t('settings.cloudSyncDescription'),
          type: 'navigation',
          onPress: () => setShowCloudSync(true),
        },
      ],
    },
    {
      title: t('profile.helpSupport'),
      items: [
        {
          icon: <HelpCircle size={20} color={colors.primary} />,
          title: t('settings.helpCenter'),
          subtitle: t('settings.helpCenterDescription'),
          type: 'navigation',
          onPress: () => console.log('Help Center'),
        },
        {
          icon: <Info size={20} color={colors.primary} />,
          title: t('settings.aboutApp'),
          subtitle: t('settings.aboutAppDescription'),
          type: 'navigation',
          onPress: () => console.log('About App'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    if (item.type === 'language') {
      return <LanguageSelector key={item.title} />;
    }

    return (
      <TouchableOpacity
        key={item.title}
        style={[styles.settingItem, { backgroundColor: colors.surface }]}
        disabled={item.type === 'switch'}
        onPress={item.onPress}
      >
        <View style={styles.settingIcon}>
          {item.icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        </View>
        <View style={styles.settingAction}>
          {item.type === 'switch' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          ) : (
            <ChevronRight size={20} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('profile.title')}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <User size={32} color={colors.background} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              User
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              user@example.com
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Settings size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.settingsGroup}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
              {group.title}
            </Text>
            <View style={[styles.groupContainer, { backgroundColor: colors.surface }]}>
              {group.items.map((item, itemIndex) => (
                <View key={item.title}>
                  {renderSettingItem(item)}
                  {itemIndex < group.items.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            {t('home.subtitle')}
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Email Settings Modal */}
      {showEmailSettings && (
        <View style={styles.fullScreenModal}>
          <EmailSettingsScreen
            onBack={() => setShowEmailSettings(false)}
            onConnectedAccounts={() => {
              setShowEmailSettings(false);
              setShowConnectedAccounts(true);
            }}
            onAddAccount={() => {
              setShowEmailSettings(false);
              setShowEmailIntegration(true);
            }}
            onSyncFrequency={() => {
              setShowEmailSettings(false);
              setShowSyncFrequency(true);
            }}
          />
        </View>
      )}

      {/* Connected Accounts Modal */}
      {showConnectedAccounts && (
        <View style={styles.fullScreenModal}>
          <ConnectedAccountsScreen
            onBack={() => setShowConnectedAccounts(false)}
            onAddAccount={() => {
              setShowConnectedAccounts(false);
              setShowEmailIntegration(true);
            }}
          />
        </View>
      )}

      {/* Email Integration Modal */}
      {showEmailIntegration && (
        <EmailIntegrationScreen
          onBack={() => setShowEmailIntegration(false)}
          onGrantAccess={async () => {
            setShowEmailIntegration(false);
            setIsScanning(true);
            
            // 模拟扫描过程
            setTimeout(() => {
              setIsScanning(false);
              setShowEmailParsing(true);
            }, 2000); // 2秒扫描动画
          }}
        />
      )}

      {/* Scanning Modal */}
      {isScanning && (
        <View style={[styles.scanningModal, { backgroundColor: colors.background }]}>
          <View style={styles.scanningContent}>
            <Text style={[styles.scanningTitle, { color: colors.text }]}>
              {t('common.loading')}
            </Text>
            <Text style={[styles.scanningSubtitle, { color: colors.textSecondary }]}>
              Scanning for verification accounts...
            </Text>
            {/* 旋转加载动画 */}
            <Animated.View 
              style={[
                styles.loadingIndicator, 
                { 
                  borderColor: colors.primary,
                  transform: [{
                    rotate: spinValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Email Parsing Modal */}
      {showEmailParsing && (
        <EmailParsingScreen
          onBack={() => setShowEmailParsing(false)}
          onActivate2FA={(accounts: Account[]) => {
            setShowEmailParsing(false);
            console.log('Activated 2FA for accounts:', accounts);
          }}
        />
      )}

      {/* Sync Frequency Modal */}
      <SyncFrequencyModal
        visible={showSyncFrequency}
        currentFrequency={emailSyncFrequency}
        onSelect={(frequency) => setEmailSyncFrequency(frequency)}
        onClose={() => setShowSyncFrequency(false)}
      />

      {/* Cloud Sync Static Modal */}
      {showCloudSync && (
        <View style={styles.fullScreenModal}>
          <CloudSyncStaticScreen onClose={() => setShowCloudSync(false)} />
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowCloudSync(false)}>
            <Text style={styles.closeModalText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  groupContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingAction: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    marginLeft: 48,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
  },
  scanningModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scanningContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scanningTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  scanningSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  closeModalText: {
    color: '#1976F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 