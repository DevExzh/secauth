import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Mail,
  Settings
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface EmailInputScreenProps {
  onBack: () => void;
  onContinue: (emailConfig: EmailConfig) => void;
}

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

export const EmailInputScreen: React.FC<EmailInputScreenProps> = ({ 
  onBack, 
  onContinue 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Advanced settings
  const [protocol, setProtocol] = useState<'IMAP' | 'POP3'>('IMAP');
  const [imapServer, setImapServer] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [smtpServer, setSmtpServer] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [useSsl, setUseSsl] = useState(true);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const autoConfigureServers = (emailAddress: string) => {
    const domain = emailAddress.split('@')[1]?.toLowerCase();
    
    // Common email providers auto-configuration
    const configs: Record<string, {imap: string, imapPort: string, smtp: string, smtpPort: string}> = {
      'gmail.com': {
        imap: 'imap.gmail.com',
        imapPort: '993',
        smtp: 'smtp.gmail.com',
        smtpPort: '587'
      },
      'outlook.com': {
        imap: 'outlook.office365.com',
        imapPort: '993',
        smtp: 'smtp-mail.outlook.com',
        smtpPort: '587'
      },
      'hotmail.com': {
        imap: 'outlook.office365.com',
        imapPort: '993',
        smtp: 'smtp-mail.outlook.com',
        smtpPort: '587'
      },
      'yahoo.com': {
        imap: 'imap.mail.yahoo.com',
        imapPort: '993',
        smtp: 'smtp.mail.yahoo.com',
        smtpPort: '587'
      },
      'icloud.com': {
        imap: 'imap.mail.me.com',
        imapPort: '993',
        smtp: 'smtp.mail.me.com',
        smtpPort: '587'
      }
    };

    if (domain && configs[domain]) {
      const config = configs[domain];
      setImapServer(config.imap);
      setImapPort(config.imapPort);
      setSmtpServer(config.smtp);
      setSmtpPort(config.smtpPort);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (validateEmail(text) && !showAdvanced) {
      autoConfigureServers(text);
    }
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

    if (!password.trim()) {
      Alert.alert(t('emailInput.alerts.error'), t('emailInput.alerts.passwordRequired'));
      return;
    }

    if (showAdvanced && (!imapServer.trim() || !smtpServer.trim())) {
      Alert.alert(t('emailInput.alerts.error'), t('emailInput.alerts.serverConfigRequired'));
      return;
    }

    setIsValidating(true);
    try {
      // 模拟邮箱连接验证过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const emailConfig: EmailConfig = {
        email: email.trim(),
        password: password.trim(),
        protocol,
        imapServer: imapServer.trim(),
        imapPort: imapPort.trim(),
        smtpServer: smtpServer.trim(),
        smtpPort: smtpPort.trim(),
        useSsl
      };
      
      onContinue(emailConfig);
    } catch (error) {
      console.error('Email configuration error:', error);
      Alert.alert(t('emailInput.alerts.error'), t('emailInput.alerts.connectionError'));
    } finally {
      setIsValidating(false);
    }
  };

  const renderProtocolSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t('emailInput.protocol')}
      </Text>
      <TouchableOpacity
        style={[styles.dropdown, { 
          backgroundColor: colors.surface,
          borderColor: colors.border
        }]}
        onPress={() => {
          setProtocol(protocol === 'IMAP' ? 'POP3' : 'IMAP');
        }}
      >
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {protocol}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('emailInput.protocolHint')}
      </Text>
    </View>
  );

  const renderServerConfig = () => (
    <View style={styles.serverConfig}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('emailInput.serverSettings')}
      </Text>
      
      {/* IMAP/POP3 Server */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('emailInput.incomingServer')} ({protocol})
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={imapServer}
          onChangeText={setImapServer}
          placeholder={protocol === 'IMAP' ? 'imap.example.com' : 'pop3.example.com'}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      {/* IMAP/POP3 Port */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('emailInput.incomingPort')}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={imapPort}
          onChangeText={setImapPort}
          placeholder="993"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      {/* SMTP Server */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('emailInput.outgoingServer')} (SMTP)
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={smtpServer}
          onChangeText={setSmtpServer}
          placeholder="smtp.example.com"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      {/* SMTP Port */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('emailInput.outgoingPort')}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={smtpPort}
          onChangeText={setSmtpPort}
          placeholder="587"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      {/* SSL Option */}
      <TouchableOpacity
        style={styles.sslOption}
        onPress={() => setUseSsl(!useSsl)}
      >
        <View style={[
          styles.checkbox,
          { 
            backgroundColor: useSsl ? colors.primary : 'transparent',
            borderColor: useSsl ? colors.primary : colors.border
          }
        ]}>
          {useSsl && <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text>}
        </View>
        <Text style={[styles.sslOptionText, { color: colors.text }]}>
          {t('emailInput.useSsl')}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                style={[styles.inputField, { color: colors.text }]}
                value={email}
                onChangeText={handleEmailChange}
                placeholder={t('emailInput.emailPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('emailInput.passwordLabel')}
            </Text>
            <View style={[styles.inputContainer, { 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }]}>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder={t('emailInput.passwordPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? 
                  <EyeOff size={20} color={colors.textSecondary} /> : 
                  <Eye size={20} color={colors.textSecondary} />
                }
              </TouchableOpacity>
            </View>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t('emailInput.passwordHint')}
            </Text>
          </View>

          {/* Advanced Settings Toggle */}
          <TouchableOpacity
            style={[styles.advancedToggle, { borderColor: colors.border }]}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <View style={styles.advancedToggleContent}>
              <Settings size={20} color={colors.primary} />
              <Text style={[styles.advancedToggleText, { color: colors.text }]}>
                {t('emailInput.advancedSettings')}
              </Text>
            </View>
            <ChevronDown 
              size={20} 
              color={colors.textSecondary}
              style={showAdvanced ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </TouchableOpacity>

          {/* Advanced Settings */}
          {showAdvanced && (
            <View style={styles.advancedSettings}>
              {renderProtocolSelector()}
              {renderServerConfig()}
            </View>
          )}

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
                  backgroundColor: email.trim() && validateEmail(email.trim()) && password.trim()
                    ? colors.primary 
                    : colors.border 
                }
              ]}
              onPress={handleContinue}
              disabled={!email.trim() || !validateEmail(email.trim()) || !password.trim() || isValidating}
            >
              <Text style={[
                styles.continueButtonText, 
                { 
                  color: email.trim() && validateEmail(email.trim()) && password.trim()
                    ? colors.background 
                    : colors.textSecondary 
                }
              ]}>
                {isValidating ? t('emailInput.connecting') : t('emailInput.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
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
    marginBottom: 24,
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
  inputField: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  hint: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  advancedToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  advancedSettings: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  serverConfig: {
    marginTop: 16,
  },
  sslOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sslOptionText: {
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