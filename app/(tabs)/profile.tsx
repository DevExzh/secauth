import { AutoLockSettingsModal } from '@/components/auth/AutoLockSettingsModal';
import { PinModal } from '@/components/auth/PinModal';
import { LoadingModal, ProfileHeader, SettingsGroup } from '@/components/profile';
import { AboutAppScreen, CloudSyncSettings, ConnectedAccountsScreen, EmailIntegrationScreen, EmailParsingScreen, EmailSettingsScreen, ExportDataScreen, HelpCenterScreen, ImportDataScreen, SyncFrequencyModal } from '@/components/settings';
import { ThemeModal } from '@/components/ui/ThemeModal';
import { Colors } from '@/constants/Colors';
import { createSettingsGroups } from '@/constants/ProfileSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfileModals } from '@/hooks/useProfileModals';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useTheme } from '@/hooks/useTheme';
import { AutoLockService, AutoLockSettings } from '@/services/autoLock';
import { Account } from '@/types/auth';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { currentColorScheme } = useTheme();

  // Custom hooks for state management
  const settings = useProfileSettings();
  const modals = useProfileModals();

  // Color scheme based on current theme
  const colors = Colors[currentColorScheme];

  // Create settings configuration
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
    },
    {
      handleBiometricToggle: settings.handleBiometricToggle,
      setShowPinModal: modals.setShowPinModal,
      setShowAutoLockModal: modals.setShowAutoLockModal,
      setShowThemeModal: modals.setShowThemeModal,
      setNotifications: settings.setNotifications,
      setShowEmailSettings: modals.setShowEmailSettings,
      setShowConnectedAccounts: modals.setShowConnectedAccounts,
      setEmailAutoSync: settings.setEmailAutoSync,
      setShowSyncFrequency: modals.setShowSyncFrequency,
      setAutoDeleteEmails: settings.setAutoDeleteEmails,
      setEmailNotifications: settings.setEmailNotifications,
      setShowCloudSync: modals.setShowCloudSync,
      setShowImportData: modals.setShowImportData,
      setShowExportData: modals.setShowExportData,
      setShowHelpCenter: modals.setShowHelpCenter,
      setShowAboutApp: modals.setShowAboutApp,
    }
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={currentColorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('profile.title')}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
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
      </ScrollView>

      {/* Modals */}
      {/* Theme Modal */}
      <ThemeModal
        visible={modals.showThemeModal}
        currentTheme={settings.themeMode}
        onThemeSelect={settings.handleThemeChange}
        onClose={modals.closeThemeModal}
        colors={colors}
      />

      {/* Email Settings Modal */}
      {modals.showEmailSettings && (
        <View style={styles.fullScreenModal}>
          <EmailSettingsScreen
            onBack={modals.closeEmailSettings}
            onConnectedAccounts={modals.navigateToConnectedAccounts}
            onAddAccount={modals.navigateToEmailIntegration}
            onSyncFrequency={modals.navigateToSyncFrequency}
          />
        </View>
      )}

      {/* Connected Accounts Modal */}
      {modals.showConnectedAccounts && (
        <View style={styles.fullScreenModal}>
          <ConnectedAccountsScreen
            onBack={modals.closeConnectedAccounts}
            onAddAccount={modals.navigateToEmailIntegration}
          />
        </View>
      )}

      {/* Email Integration Modal */}
      {modals.showEmailIntegration && (
        <EmailIntegrationScreen
          onBack={modals.closeEmailIntegration}
          onGrantAccess={modals.handleGrantAccess}
        />
      )}

      {/* Loading Modal */}
      <LoadingModal
        visible={modals.isScanning}
        colors={colors}
        title={t('common.loading')}
        subtitle="Scanning for verification accounts..."
      />

      {/* Email Parsing Modal */}
      {modals.showEmailParsing && (
        <EmailParsingScreen
          onBack={modals.closeEmailParsing}
          onActivate2FA={(accounts: Account[]) => {
            modals.closeEmailParsing();
            console.log('Activated 2FA for accounts:', accounts);
          }}
        />
      )}

      {/* Sync Frequency Modal */}
      <SyncFrequencyModal
        visible={modals.showSyncFrequency}
        currentFrequency={settings.emailSyncFrequency}
        onSelect={(frequency) => settings.setEmailSyncFrequency(frequency)}
        onClose={modals.closeSyncFrequency}
      />

      {/* Cloud Sync Modal */}
      {modals.showCloudSync && (
        <View style={styles.fullScreenModal}>
          <CloudSyncSettings onBack={modals.closeCloudSync} />
          <TouchableOpacity style={styles.closeModalBtn} onPress={modals.closeCloudSync}>
            <Text style={[styles.closeModalText, { color: colors.primary }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PIN Modal */}
      <PinModal
        visible={modals.showPinModal}
        onClose={modals.closePinModal}
        onPinSet={settings.handlePinSet}
        mode={settings.hasPinSet ? 'verify' : 'set'}
      />

      {/* Auto-Lock Settings Modal */}
      <AutoLockSettingsModal
        visible={modals.showAutoLockModal}
        onClose={modals.closeAutoLockModal}
        onSettingsChange={(autoLockSettings: AutoLockSettings) => {
          AutoLockService.updateSettings(autoLockSettings);
        }}
      />

      {/* Import Data Modal */}
      {modals.showImportData && (
        <View style={styles.fullScreenModal}>
          <ImportDataScreen onBack={modals.closeImportData} />
        </View>
      )}

      {/* Export Data Modal */}
      {modals.showExportData && (
        <View style={styles.fullScreenModal}>
          <ExportDataScreen onBack={modals.closeExportData} />
        </View>
      )}

      {/* Help Center Modal */}
      {modals.showHelpCenter && (
        <View style={styles.fullScreenModal}>
          <HelpCenterScreen onBack={modals.closeHelpCenter} />
        </View>
      )}

      {/* About App Modal */}
      {modals.showAboutApp && (
        <View style={styles.fullScreenModal}>
          <AboutAppScreen onBack={modals.closeAboutApp} />
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
    minHeight: 56,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 