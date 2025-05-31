import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
    ArrowLeft,
    Mail
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EmailInputScreenProps {
  onBack: () => void;
  onContinue: (email: string) => void;
}

export const EmailInputScreen: React.FC<EmailInputScreenProps> = ({ 
  onBack, 
  onContinue 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert(t('emailInput.alerts.error'), t('emailInput.alerts.emailRequired'));
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert(t('emailInput.alerts.error'), t('emailInput.alerts.invalidEmail'));
      return;
    }

    setIsValidating(true);
    try {
      // 模拟邮箱验证过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      onContinue(email.trim());
    } catch (error) {
      Alert.alert(t('emailInput.alerts.error'), t('emailInput.alerts.validationError'));
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('emailInput.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Icon Section */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.primary }]}>
            <Mail size={48} color={colors.background} />
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('emailInput.subtitle')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('emailInput.description')}
          </Text>
        </View>

        {/* Email Input Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('emailInput.emailLabel')}
          </Text>
          <View style={[styles.inputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.border
          }]}>
            <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder={t('emailInput.emailPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>
        </View>

        {/* Info Section */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t('emailInput.infoTitle')}
          </Text>
          <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
            {t('emailInput.infoDescription')}
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton, 
              { 
                backgroundColor: email.trim() && validateEmail(email.trim()) 
                  ? colors.primary 
                  : colors.border 
              }
            ]}
            onPress={handleContinue}
            disabled={!email.trim() || !validateEmail(email.trim()) || isValidating}
          >
            <Text style={[
              styles.continueButtonText, 
              { 
                color: email.trim() && validateEmail(email.trim()) 
                  ? colors.background 
                  : colors.textSecondary 
              }
            ]}>
              {isValidating ? t('emailInput.validating') : t('emailInput.continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 