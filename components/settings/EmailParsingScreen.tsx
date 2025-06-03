import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { EmailService } from '@/services/emailService';
import { Account } from '@/types/auth';
import {
    ArrowLeft,
    Check,
    Clock,
    Shield
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface EmailParsingScreenProps {
  onBack: () => void;
  onActivate2FA: (accounts: Account[]) => void;
  userEmail?: string;
}

export const EmailParsingScreen: React.FC<EmailParsingScreenProps> = ({ 
  onBack, 
  onActivate2FA,
  userEmail
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [deleteProcessedEmails, setDeleteProcessedEmails] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      // 模拟加载过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data - 模拟从邮件中解析出的账户
      const mockAccounts: Account[] = [
        {
          id: 'email-otp-' + Date.now() + '-1',
          name: 'Google Email Verification',
          email: userEmail || 'user@example.com',
          secret: 'JBSWY3DPEHPK3PXP',
          type: 'EMAIL_OTP',
          category: 'Social',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          isTemporary: true,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15分钟后过期
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'email-otp-' + Date.now() + '-2',
          name: 'GitHub Email Verification',
          email: userEmail || 'user@example.com',
          secret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ',
          type: 'EMAIL_OTP',
          category: 'Work',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          isTemporary: true,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分钟后过期
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'email-otp-' + Date.now() + '-3',
          name: 'Apple ID Email Verification',
          email: userEmail || 'user@example.com',
          secret: 'KRMVATZTJFZUC53FONXW2ZJB',
          type: 'EMAIL_OTP',
          category: 'Other',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          isTemporary: true,
          expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20分钟后过期
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'email-otp-' + Date.now() + '-4',
          name: 'Discord Email Verification',
          email: userEmail || 'user@example.com',
          secret: 'NB2HI4DTHIXS653XO4XHG5UKN4',
          type: 'EMAIL_OTP',
          category: 'Social',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          isTemporary: true,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分钟后过期（已经快过期了）
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'email-otp-' + Date.now() + '-5',
          name: 'Microsoft Email Verification',
          email: userEmail || 'user@example.com',
          secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
          type: 'EMAIL_OTP',
          category: 'Work',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          isTemporary: true,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setAccounts(mockAccounts);
      setSelectedAccounts(new Set(mockAccounts.map(account => account.id)));
    } catch (error) {
      Alert.alert(t('emailParsing.alerts.error'), t('emailParsing.alerts.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccountSelection = (accountId: string) => {
    const newSelection = new Set(selectedAccounts);
    if (newSelection.has(accountId)) {
      newSelection.delete(accountId);
    } else {
      newSelection.add(accountId);
    }
    setSelectedAccounts(newSelection);
  };

  const handleActivate2FA = async () => {
    if (selectedAccounts.size === 0) {
      Alert.alert(t('emailParsing.alerts.hint'), t('emailParsing.alerts.selectAccountMessage'));
      return;
    }

    setIsActivating(true);
    try {
      const selectedAccountsList = accounts.filter(account => 
        selectedAccounts.has(account.id)
      );
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (deleteProcessedEmails) {
        await EmailService.deleteProcessedEmails(Array.from(selectedAccounts));
      }
      
      onActivate2FA(selectedAccountsList);
    } catch (error) {
      Alert.alert(t('emailParsing.alerts.error'), t('emailParsing.alerts.activationError'));
    } finally {
      setIsActivating(false);
    }
  };

  const renderAccountItem = (account: Account) => {
    const isSelected = selectedAccounts.has(account.id);
    const isExpired = account.expiresAt && new Date() > account.expiresAt;
    const isExpiringSoon = account.expiresAt && 
      new Date(account.expiresAt.getTime() - 10 * 60 * 1000) < new Date(); // 10分钟内过期
    
    const getTimeRemaining = () => {
      if (!account.expiresAt) return '';
      const now = new Date();
      const timeDiff = account.expiresAt.getTime() - now.getTime();
      
      if (timeDiff <= 0) return t('account.expired');
      
      const minutes = Math.floor(timeDiff / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      if (minutes > 0) {
        return t('emailParsing.expiresInMinutes', { minutes });
      } else {
        return t('emailParsing.expiresInSeconds', { seconds });
      }
    };
    
    return (
      <TouchableOpacity
        key={account.id}
        style={[
          styles.accountItem, 
          { 
            backgroundColor: colors.surface,
            opacity: isExpired ? 0.5 : 1
          }
        ]}
        onPress={() => !isExpired && toggleAccountSelection(account.id)}
        disabled={isExpired}
      >
        <View style={styles.accountIcon}>
          <Shield size={20} color={isExpired ? colors.error : colors.primary} />
        </View>
        <View style={styles.accountContent}>
          <View style={styles.accountHeader}>
            <Text style={[styles.accountName, { color: colors.text }]}>
              {account.name}
            </Text>
            <View style={[
              styles.tempLabel, 
              { 
                backgroundColor: isExpired ? colors.error + '20' : colors.warning + '20' 
              }
            ]}>
              <Clock size={12} color={isExpired ? colors.error : colors.warning} />
              <Text style={[
                styles.tempLabelText, 
                { color: isExpired ? colors.error : colors.warning }
              ]}>
                {t('account.typeTemporary')}
              </Text>
            </View>
          </View>
          <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
            {account.email}
          </Text>
          <Text style={[
            styles.expirationText, 
            { 
              color: isExpired ? colors.error : 
                     isExpiringSoon ? colors.warning : 
                     colors.textSecondary 
            }
          ]}>
            {getTimeRemaining()}
          </Text>
        </View>
        {!isExpired && (
          <View style={[
            styles.checkbox,
            { 
              backgroundColor: isSelected ? colors.primary : 'transparent',
              borderColor: isSelected ? colors.primary : colors.border
            }
          ]}>
            {isSelected && <Check size={16} color={colors.background} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('emailParsing.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.descriptionSection}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('emailParsing.description')}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('emailParsing.scanning')}
            </Text>
          </View>
        ) : (
          <View style={styles.accountsList}>
            <Text style={[styles.accountsTitle, { color: colors.text }]}>
              {t('emailParsing.foundAccounts', { count: accounts.length })}
            </Text>
            {accounts.map(renderAccountItem)}
          </View>
        )}

        {!isLoading && accounts.length > 0 && (
          <TouchableOpacity
            style={styles.deleteOption}
            onPress={() => setDeleteProcessedEmails(!deleteProcessedEmails)}
          >
            <View style={[
              styles.checkbox,
              { 
                backgroundColor: deleteProcessedEmails ? colors.primary : 'transparent',
                borderColor: deleteProcessedEmails ? colors.primary : colors.border
              }
            ]}>
              {deleteProcessedEmails && <Check size={16} color={colors.background} />}
            </View>
            <Text style={[styles.deleteOptionText, { color: colors.text }]}>
              {t('emailParsing.deleteProcessedEmails')}
            </Text>
          </TouchableOpacity>
        )}

        {!isLoading && accounts.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.activateButton, { backgroundColor: colors.primary }]}
              onPress={handleActivate2FA}
              disabled={isActivating || selectedAccounts.size === 0}
            >
              <Text style={[styles.activateButtonText, { color: colors.background }]}>
                {isActivating ? t('emailParsing.activating') : t('emailParsing.activate2FA')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secureButton, { borderColor: colors.primary }]}
              onPress={() => {
                Alert.alert(t('emailParsing.alerts.securityConnection'), t('emailParsing.alerts.securityConnectionSettings'));
              }}
            >
              <Text style={[styles.secureButtonText, { color: colors.primary }]}>
                {t('emailParsing.secureConnection')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  descriptionSection: {
    paddingVertical: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  accountsList: {
    marginBottom: 24,
  },
  accountsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountContent: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
  },
  tempLabel: {
    padding: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempLabelText: {
    fontSize: 12,
    marginLeft: 4,
  },
  expirationText: {
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  deleteOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  buttonContainer: {
    paddingVertical: 24,
    gap: 12,
  },
  activateButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secureButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secureButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 