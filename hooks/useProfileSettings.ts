import { BiometricAuthService } from '@/services/biometricAuth';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from './useLanguage';

export const useProfileSettings = () => {
  const { t } = useLanguage();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [emailAutoSync, setEmailAutoSync] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDeleteEmails, setAutoDeleteEmails] = useState(true);
  const [emailSyncFrequency, setEmailSyncFrequency] = useState(t('emailSettings.syncFrequency'));
  const [connectedEmailAccounts] = useState(2); // Mock connected accounts count

  // Initialize settings
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const [isBiometricEnabled, hasPIN] = await Promise.all([
          BiometricAuthService.isBiometricEnabled(),
          BiometricAuthService.hasPIN(),
        ]);
        setBiometric(isBiometricEnabled);
        setHasPinSet(hasPIN);
      } catch (error) {
        console.error('Error initializing settings:', error);
      }
    };

    initializeSettings();
  }, []);

  // Handlers
  const handleDarkModeToggle = useCallback((value: boolean) => {
    setDarkMode(value);
    // Add logic to save theme preference to storage
  }, []);

  const handleBiometricToggle = useCallback(async (value: boolean) => {
    if (value) {
      if (!hasPinSet) {
        Alert.alert(
          t('settings.pinRequiredTitle'),
          t('settings.pinRequiredMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('settings.setPinNow'), onPress: () => {
              // This will be handled by the parent component
              return { action: 'showPinModal' };
            }},
          ]
        );
        return;
      }
      
      try {
        const authResult = await BiometricAuthService.authenticateWithBiometrics(t('auth.biometric.prompt'));
        if (authResult.success) {
          await BiometricAuthService.setBiometricEnabled(true);
          setBiometric(true);
          Alert.alert(t('auth.biometric.enabled'));
        } else {
          Alert.alert(t('auth.biometric.authenticationFailed'), authResult.error);
        }
      } catch (error) {
        console.error('Biometric authentication error:', error);
        Alert.alert(t('auth.biometric.authenticationFailed'), 'An error occurred');
      }
    } else {
      try {
        await BiometricAuthService.setBiometricEnabled(false);
        setBiometric(false);
        Alert.alert(t('auth.biometric.disabled'));
      } catch (error) {
        console.error('Error disabling biometric:', error);
      }
    }
  }, [hasPinSet, t]);

  const handlePinSet = useCallback(async () => {
    setHasPinSet(true);
    
    try {
      // Optionally re-check biometric availability or prompt if they want to enable it
      const isAvailable = await BiometricAuthService.isAvailable();
      if (isAvailable && !biometric) {
        Alert.alert(
          t('settings.biometricAvailableTitle'),
          t('settings.biometricAvailableMessage'),
          [
            { text: t('common.no'), style: 'cancel' },
            { text: t('common.yes'), onPress: () => handleBiometricToggle(true) },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  }, [biometric, handleBiometricToggle, t]);

  return {
    // State values
    darkMode,
    notifications,
    biometric,
    hasPinSet,
    emailAutoSync,
    emailNotifications,
    autoDeleteEmails,
    emailSyncFrequency,
    connectedEmailAccounts,
    
    // Setters
    setNotifications,
    setEmailAutoSync,
    setEmailNotifications,
    setAutoDeleteEmails,
    setEmailSyncFrequency,
    
    // Handlers
    handleDarkModeToggle,
    handleBiometricToggle,
    handlePinSet,
  };
}; 