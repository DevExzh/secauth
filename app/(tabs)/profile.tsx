import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { LoadingModal, ProfileHeader, SettingsGroup } from '@/components/profile';
import { Colors } from '@/constants/Colors';
import { createSettingsGroups } from '@/constants/ProfileSettings';
import { useSettings } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfileModals } from '@/hooks/useProfileModals';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const modals = useProfileModals();
  const settings = useSettings();
  
  // Force re-render when screen is focused
  const [refreshKey, setRefreshKey] = useState(0);
  
  useFocusEffect(
    useCallback(() => {
      // Force re-render by updating key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const settingsGroups = createSettingsGroups(
    colors,
    t,
    {
      biometric: settings.biometric,
      hasPinSet: settings.hasPinSet,
      themeMode: settings.themeMode,
      notifications: settings.notifications,
      emailAutoSync: settings.emailAutoSync,
      emailNotifications: settings.emailNotifications,
      autoDeleteEmails: settings.autoDeleteEmails,
      connectedEmailAccounts: settings.connectedEmailAccounts,
      emailSyncFrequency: settings.emailSyncFrequency,
    },
    {
      handleBiometricToggle: settings.handleBiometricToggle,
      setNotifications: settings.setNotifications,
      setEmailAutoSync: settings.setEmailAutoSync,
      setAutoDeleteEmails: settings.setAutoDeleteEmails,
      setEmailNotifications: settings.setEmailNotifications,
    }
  );

  const renderHeader = () => (
    <ScreenHeader
      title={t('profile.title')}
      showBorder={true}
    />
  );

  return (
    <Screen
      key={refreshKey} // Force re-render
      showHeader={true}
      header={renderHeader()}
      avoidTabBar={true}
      style={{ backgroundColor: colors.background }}
    >
      {/* User Profile Section */}
      <ProfileHeader colors={colors} />

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <SettingsGroup key={group.title} group={group} colors={colors} />
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

      {/* 只保留必要的overlay modals */}

      {/* Loading Modal - 用于需要loading状态的操作 */}
      <LoadingModal
        visible={modals.isScanning}
        colors={colors}
        title={t('common.loading')}
        subtitle="Processing..."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
}); 