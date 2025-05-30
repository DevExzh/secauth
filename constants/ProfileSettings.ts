import {
  Bell,
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
  Shield,
  Trash2,
  Upload,
  Wifi,
} from 'lucide-react-native';
import React from 'react';

export interface SettingItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  type: 'switch' | 'navigation' | 'language' | 'theme';
  value?: boolean;
  themeValue?: string; // For theme selection
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
}

export interface SettingsGroup {
  title: string;
  items: SettingItem[];
}

export const createSettingsGroups = (
  colors: any,
  t: (key: string) => string,
  values: {
    biometric: boolean;
    hasPinSet: boolean;
    themeMode: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailAutoSync: boolean;
    emailNotifications: boolean;
    autoDeleteEmails: boolean;
    connectedEmailAccounts: number;
  },
  handlers: {
    handleBiometricToggle: (value: boolean) => void;
    setShowPinModal: (show: boolean) => void;
    setShowAutoLockModal: (show: boolean) => void;
    setShowThemeModal: (show: boolean) => void;
    setNotifications: (value: boolean) => void;
    setShowEmailSettings: (show: boolean) => void;
    setShowConnectedAccounts: (show: boolean) => void;
    setEmailAutoSync: (value: boolean) => void;
    setShowSyncFrequency: (show: boolean) => void;
    setAutoDeleteEmails: (value: boolean) => void;
    setEmailNotifications: (value: boolean) => void;
    setShowCloudSync: (show: boolean) => void;
    setShowImportData: (show: boolean) => void;
    setShowExportData: (show: boolean) => void;
    setShowHelpCenter: (show: boolean) => void;
    setShowAboutApp: (show: boolean) => void;
  }
): SettingsGroup[] => [
  {
    title: t('profile.security'),
    items: [
      {
        icon: React.createElement(Lock, { size: 20, color: colors.primary }),
        title: t('settings.biometricUnlock'),
        subtitle: t('settings.biometricDescription'),
        type: 'switch',
        value: values.biometric,
        onToggle: handlers.handleBiometricToggle,
      },
      {
        icon: React.createElement(Shield, { size: 20, color: colors.primary }),
        title: values.hasPinSet ? t('settings.changePin') : t('settings.setPin'),
        subtitle: values.hasPinSet ? t('settings.changePinDescription') : t('settings.setPinDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowPinModal(true),
      },
      {
        icon: React.createElement(Shield, { size: 20, color: colors.primary }),
        title: t('settings.autoLock'),
        subtitle: t('settings.autoLockDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowAutoLockModal(true),
      },
    ],
  },
  {
    title: t('profile.preferences'),
    items: [
      {
        icon: React.createElement(Globe, { size: 20, color: colors.primary }),
        title: t('settings.language'),
        subtitle: '',
        type: 'language',
      },
      {
        icon: React.createElement(Moon, { size: 20, color: colors.primary }),
        title: t('settings.theme'),
        subtitle: t(`settings.themeOptions.${values.themeMode}`),
        type: 'theme',
        themeValue: values.themeMode,
        onPress: () => handlers.setShowThemeModal(true),
      },
      {
        icon: React.createElement(Bell, { size: 20, color: colors.primary }),
        title: t('settings.notifications'),
        subtitle: t('settings.notificationsDescription'),
        type: 'switch',
        value: values.notifications,
        onToggle: handlers.setNotifications,
      },
    ],
  },
  {
    title: t('profile.emailSettings'),
    items: [
      {
        icon: React.createElement(Mail, { size: 20, color: colors.primary }),
        title: t('settings.emailIntegration'),
        subtitle: t('settings.emailIntegrationDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowEmailSettings(true),
      },
      {
        icon: React.createElement(Link, { size: 20, color: colors.primary }),
        title: t('settings.connectedAccounts'),
        subtitle: `${values.connectedEmailAccounts} ${t('settings.connectedAccountsDescription')}`,
        type: 'navigation',
        onPress: () => handlers.setShowConnectedAccounts(true),
      },
      {
        icon: React.createElement(RefreshCw, { size: 20, color: colors.primary }),
        title: t('settings.autoSync'),
        subtitle: t('settings.autoSyncDescription'),
        type: 'switch',
        value: values.emailAutoSync,
        onToggle: handlers.setEmailAutoSync,
      },
      {
        icon: React.createElement(Clock, { size: 20, color: colors.primary }),
        title: t('settings.syncFrequency'),
        subtitle: t('settings.syncFrequencyDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowSyncFrequency(true),
      },
      {
        icon: React.createElement(Trash2, { size: 20, color: colors.primary }),
        title: t('settings.autoDeleteEmails'),
        subtitle: t('settings.autoDeleteEmailsDescription'),
        type: 'switch',
        value: values.autoDeleteEmails,
        onToggle: handlers.setAutoDeleteEmails,
      },
      {
        icon: React.createElement(MailCheck, { size: 20, color: colors.primary }),
        title: t('settings.emailNotifications'),
        subtitle: t('settings.emailNotificationsDescription'),
        type: 'switch',
        value: values.emailNotifications,
        onToggle: handlers.setEmailNotifications,
      },
    ],
  },
  {
    title: t('profile.dataManagement'),
    items: [
      {
        icon: React.createElement(Upload, { size: 20, color: colors.primary }),
        title: t('settings.exportData'),
        subtitle: t('settings.exportDataDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowExportData(true),
      },
      {
        icon: React.createElement(Download, { size: 20, color: colors.primary }),
        title: t('settings.importData'),
        subtitle: t('settings.importDataDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowImportData(true),
      },
      {
        icon: React.createElement(Wifi, { size: 20, color: colors.primary }),
        title: t('settings.cloudSync'),
        subtitle: t('settings.cloudSyncDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowCloudSync(true),
      },
    ],
  },
  {
    title: t('profile.helpSupport'),
    items: [
      {
        icon: React.createElement(HelpCircle, { size: 20, color: colors.primary }),
        title: t('settings.helpCenter'),
        subtitle: t('settings.helpCenterDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowHelpCenter(true),
      },
      {
        icon: React.createElement(Info, { size: 20, color: colors.primary }),
        title: t('settings.aboutApp'),
        subtitle: t('settings.aboutAppDescription'),
        type: 'navigation',
        onPress: () => handlers.setShowAboutApp(true),
      },
    ],
  },
]; 