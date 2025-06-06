import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Colors } from '@/constants/Colors';
import type { AddFormData } from '@/hooks/useAddModals';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { AccountService } from '@/services/accountService';
import { OTPService } from '@/services/otpService';
import type { AuthType } from '@/types/auth';
import { Check, ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ManualAddFormProps {
  formData: AddFormData;
  onFormDataChange: (updates: Partial<AddFormData>) => void;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualAddForm: React.FC<ManualAddFormProps> = ({
  formData,
  onFormDataChange,
  onClose,
  onSuccess,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleManualAdd = async () => {
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.secret) {
        Alert.alert(t('add.alerts.error'), t('add.alerts.errorMessage'));
        return;
      }
      
      // Type-specific validation
      if (formData.type === 'mOTP' && !formData.pin) {
        Alert.alert(t('add.alerts.error'), 'PIN is required for mOTP');
        return;
      }

      if (formData.type === 'HOTP' && (!formData.counter || isNaN(parseInt(formData.counter)))) {
        Alert.alert(t('add.alerts.error'), 'Valid counter is required for HOTP');
        return;
      }

      // Validate secret format
      if (!OTPService.validateSecret(formData.secret)) {
        Alert.alert(t('add.alerts.error'), 'Invalid secret key format');
        return;
      }

      // Validate digits
      const digits = parseInt(formData.digits);
      if (isNaN(digits) || digits < 4 || digits > 8) {
        Alert.alert(t('add.alerts.error'), 'Digits must be between 4 and 8');
        return;
      }

      // Validate period for TOTP
      if (formData.type === 'TOTP') {
        const period = parseInt(formData.period);
        if (isNaN(period) || period < 1 || period > 300) {
          Alert.alert(t('add.alerts.error'), 'Period must be between 1 and 300 seconds');
          return;
        }
      }
      
      // Create account object
      const newAccount = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        secret: formData.secret.trim(),
        type: formData.type,
        category: formData.category,
        algorithm: formData.algorithm,
        digits: parseInt(formData.digits),
        period: formData.type === 'TOTP' ? parseInt(formData.period) : undefined,
        counter: formData.type === 'HOTP' ? parseInt(formData.counter) : undefined,
        pin: formData.type === 'mOTP' ? formData.pin : undefined,
      };

      // Save the account using AccountService
      const savedAccount = await AccountService.addAccount(newAccount);
      
      Alert.alert(
        t('add.alerts.addSuccess'),
        t('add.alerts.addSuccessMessage', { name: savedAccount.name }),
        [
          {
            text: t('add.alerts.ok'),
            onPress: onSuccess
          }
        ]
      );
    } catch (error) {
      console.error('Error adding account:', error);
      Alert.alert(
        t('add.alerts.error'),
        error instanceof Error ? error.message : t('add.alerts.unknownError'),
        [{ text: t('add.alerts.ok') }]
      );
    }
  };

  return (
    <Screen
      showHeader={true}
      header={
        <ScreenHeader
          title={t('add.manual.title')}
          onBack={onClose}
          showBorder={true}
        />
      }
      avoidTabBar={true}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: 24 }}
    >
      {/* Type Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('add.manual.type')}
        </Text>
        <TouchableOpacity
          style={[styles.dropdown, { 
            backgroundColor: colors.surface,
            borderColor: colors.border
          }]}
          onPress={() => {
            const types: AuthType[] = ['TOTP', 'HOTP', 'mOTP', 'Steam'];
            const currentIndex = types.indexOf(formData.type);
            const nextIndex = (currentIndex + 1) % types.length;
            onFormDataChange({ type: types[nextIndex] });
          }}
        >
          <Text style={[styles.dropdownText, { color: colors.text }]}>
            {t(`add.manual.typeOptions.${formData.type}`)}
          </Text>
          <ChevronDown size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Service Name */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('add.manual.serviceName')}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={formData.name}
          onChangeText={(text) => onFormDataChange({ name: text })}
          placeholder={t('add.manual.serviceNamePlaceholder')}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Account Email */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('add.manual.accountEmail')}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={formData.email}
          onChangeText={(text) => onFormDataChange({ email: text })}
          placeholder={t('add.manual.accountEmailPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Secret Key */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('add.manual.secretKey')}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={formData.secret}
          onChangeText={(text) => onFormDataChange({ secret: text })}
          placeholder={t('add.manual.secretKeyPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="characters"
          secureTextEntry
        />
      </View>

      {/* mOTP PIN Field */}
      {formData.type === 'mOTP' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('add.manual.pin')}
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.pin}
            onChangeText={(text) => onFormDataChange({ pin: text })}
            placeholder={t('add.manual.pinPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            maxLength={4}
          />
        </View>
      )}

      {/* HOTP Counter Field */}
      {formData.type === 'HOTP' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('add.manual.counter')}
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.counter}
            onChangeText={(text) => onFormDataChange({ counter: text })}
            placeholder={t('add.manual.counterPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      )}

      {/* Advanced Options Toggle */}
      {(formData.type === 'TOTP' || formData.type === 'HOTP') && (
        <TouchableOpacity
          style={[styles.advancedToggle, { borderColor: colors.border }]}
          onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <Text style={[styles.advancedToggleText, { color: colors.text }]}>
            {t('add.manual.advancedOptions')}
          </Text>
          <ChevronDown 
            size={20} 
            color={colors.textSecondary}
            style={showAdvancedOptions ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </TouchableOpacity>
      )}

      {/* Advanced Options */}
      {showAdvancedOptions && (formData.type === 'TOTP' || formData.type === 'HOTP') && (
        <View style={styles.advancedOptions}>
          {/* Algorithm Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('add.manual.algorithm')}
            </Text>
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: colors.surface,
                borderColor: colors.border
              }]}
              onPress={() => {
                const algorithms: ('SHA1' | 'SHA256' | 'SHA512')[] = ['SHA1', 'SHA256', 'SHA512'];
                const currentIndex = algorithms.indexOf(formData.algorithm);
                const nextIndex = (currentIndex + 1) % algorithms.length;
                onFormDataChange({ algorithm: algorithms[nextIndex] });
              }}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {t(`add.manual.algorithmOptions.${formData.algorithm}`)}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Digits and Period */}
          <View style={styles.twoColumnRow}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('add.manual.digits')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                value={formData.digits}
                onChangeText={(text) => onFormDataChange({ digits: text })}
                keyboardType="numeric"
                maxLength={1}
              />
            </View>

            {/* Period (TOTP only) */}
            {formData.type === 'TOTP' && (
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t('add.manual.period')}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={formData.period}
                  onChangeText={(text) => onFormDataChange({ period: text })}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleManualAdd}
      >
        <Check size={20} color={colors.background} />
        <Text style={[styles.addButtonText, { color: colors.background }]}>
          {t('add.manual.addButton')}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  advancedOptions: {
    marginBottom: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 