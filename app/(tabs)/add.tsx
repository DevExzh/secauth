import { ManualAddForm } from '@/components/account/ManualAddForm';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Colors } from '@/constants/Colors';
import { useAddModals } from '@/hooks/useAddModals';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { AccountService } from '@/services/accountService';
import { OTPService } from '@/services/otpService';
import { determineCategory } from '@/utils/totpParser';
import { router } from 'expo-router';
import {
  Camera,
  Mail,
  Plus,
  QrCode,
  Shield,
  Type
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function AddScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const {
    showManualForm,
    formData,
    openQRScanner,
    closeQRScanner,
    openManualForm,
    closeManualForm,
    updateFormData,
    resetFormData,
    setFormData,
  } = useAddModals();

  // Note: handleQRScanResult is implemented but will be used when QR scanner integration is completed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQRScanResult = async (data: string) => {
    closeQRScanner();
    
    try {
      const parsedData = OTPService.parseOTPUri(data);
      if (parsedData) {
        // Create a complete account object
        const newAccount = {
          name: parsedData.name || '',
          email: parsedData.email || '',
          secret: parsedData.secret || '',
          type: parsedData.type || 'TOTP' as const,
          category: determineCategory(parsedData.name || ''),
          issuer: parsedData.issuer,
          algorithm: parsedData.algorithm || 'SHA1' as const,
          digits: parsedData.digits || 6,
          period: parsedData.period || 30,
          counter: parsedData.counter || 0,
          pin: parsedData.pin || undefined,
        };

        // Validate required fields
        if (!newAccount.name || !newAccount.email || !newAccount.secret) {
          Alert.alert(
            t('add.alerts.scanFailed'),
            t('add.alerts.incompleteData'),
            [
              { text: t('add.alerts.manualInput'), onPress: () => {
                // Auto-fill form with scanned data
                setFormData({
                  name: newAccount.name,
                  email: newAccount.email,
                  secret: newAccount.secret,
                  type: newAccount.type,
                  category: newAccount.category,
                  pin: newAccount.pin || '',
                  counter: newAccount.counter.toString(),
                  algorithm: newAccount.algorithm,
                  digits: newAccount.digits.toString(),
                  period: newAccount.period.toString(),
                });
                                  openManualForm();
              }},
              { text: t('add.alerts.cancel') }
            ]
          );
          return;
        }

        // Save the account using AccountService
        const savedAccount = await AccountService.addAccount(newAccount);
        
        Alert.alert(
          t('add.alerts.scanSuccess'),
          t('add.alerts.scanSuccessMessage', { name: savedAccount.name }),
          [{ text: t('add.alerts.ok') }]
        );
      } else {
        Alert.alert(
          t('add.alerts.scanFailed'),
          t('add.alerts.scanFailedMessage'),
          [
            { text: t('add.alerts.manualInput'), onPress: openManualForm },
            { text: t('add.alerts.rescan'), onPress: openQRScanner },
            { text: t('add.alerts.cancel') }
          ]
        );
      }
    } catch (error) {
      console.error('Error processing QR scan result:', error);
      Alert.alert(
        t('add.alerts.error'),
        error instanceof Error ? error.message : t('add.alerts.unknownError'),
        [{ text: t('add.alerts.ok') }]
      );
    }
  };

  const handleManualFormSuccess = () => {
    resetFormData();
    closeManualForm();
  };

  const handleEmailImport = () => {
            router.push('/modals/email/email-add-input' as any);
  };

  // If manual form is shown, render it
  if (showManualForm) {
    return (
      <ManualAddForm
        formData={formData}
        onFormDataChange={updateFormData}
        onClose={closeManualForm}
        onSuccess={handleManualFormSuccess}
      />
    );
  }

  return (
    <>
      <Screen
        showHeader={true}
        header={
          <ScreenHeader
            title={t('add.title')}
            showBorder={true}
          />
        }
        avoidTabBar={true}
        scrollable={true}
        style={{ backgroundColor: colors.background }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={[styles.mainIcon, { backgroundColor: colors.primary }]}>
              <Shield size={48} color={colors.background} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t('add.subtitle')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('add.description')}
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { 
                backgroundColor: colors.surface,
                borderColor: colors.border
              }]}
              onPress={openQRScanner}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
                <QrCode size={24} color={colors.background} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t('add.scanQR.title')}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {t('add.scanQR.description')}
                </Text>
              </View>
              <Camera size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { 
                backgroundColor: colors.surface,
                borderColor: colors.border
              }]}
              onPress={handleEmailImport}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
                <Mail size={24} color={colors.background} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t('add.emailImport.title')}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {t('add.emailImport.description')}
                </Text>
              </View>
              <Plus size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { 
                backgroundColor: colors.surface,
                borderColor: colors.border
              }]}
              onPress={openManualForm}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
                <Type size={24} color={colors.background} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t('add.manualInput.title')}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {t('add.manualInput.description')}
                </Text>
              </View>
              <Plus size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Screen>


    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 