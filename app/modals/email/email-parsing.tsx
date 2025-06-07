import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { EmailService } from '@/services/emailService';
import { Account } from '@/types/auth';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Clock,
  Shield
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EmailParsingModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [deleteProcessedEmails, setDeleteProcessedEmails] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  const userEmail = 'user@example.com'; // This could come from props in real implementation

  const loadAccounts = useCallback(async () => {
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
      console.error('Email parsing error:', error);
      Alert.alert(t('emailParsing.alerts.error'), t('emailParsing.alerts.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, t]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

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
      
      // TODO: Implement actual 2FA activation logic
      console.log('Activated 2FA for accounts:', selectedAccountsList);
      router.back();
    } catch (error) {
      console.error('2FA activation error:', error);
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
            <View style={styles.accountNameRow}>
              <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={2}>
                {account.name}
              </Text>
              <View style={[
                styles.tempLabel, 
                { 
                  backgroundColor: isExpired ? colors.error + '20' : colors.warning + '20' 
                }
              ]}>
                <Clock size={10} color={isExpired ? colors.error : colors.warning} />
                <Text style={[
                  styles.tempLabelText, 
                  { color: isExpired ? colors.error : colors.warning }
                ]}>
                  {t('account.typeTemporary')}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.accountEmail, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="middle">
            {account.email}
          </Text>
          <Text style={[
            styles.expirationText, 
            { 
              color: isExpired ? colors.error : 
                     isExpiringSoon ? colors.warning : 
                     colors.textSecondary 
            }
          ]} numberOfLines={1}>
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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {t('emailParsing.title')}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SmartScreen style={{ backgroundColor: colors.background }}>
      {renderHeader()}
      <ScrollView style={styles.content}>
        <View style={styles.descriptionSection}>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={0}>
            {t('emailParsing.description')}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]} numberOfLines={2}>
              {t('emailParsing.scanning')}
            </Text>
          </View>
        ) : (
          <View style={styles.accountsList}>
            <Text style={[styles.accountsTitle, { color: colors.text }]} numberOfLines={2}>
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
            <Text style={[styles.deleteOptionText, { color: colors.text }]} numberOfLines={0}>
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
              <Text style={[styles.activateButtonText, { color: colors.background }]} numberOfLines={2}>
                {isActivating ? t('emailParsing.activating') : t('emailParsing.activate2FA')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SmartScreen>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
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
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 80,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  accountContent: {
    flex: 1,
    paddingRight: 12,
    minWidth: 0, // Allow content to shrink below its minimum content size
  },
  accountHeader: {
    flexDirection: 'column',
    marginBottom: 4,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    minWidth: 0, // Allow text to shrink
  },
  accountEmail: {
    fontSize: 14,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  tempLabel: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  tempLabelText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  expirationText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexShrink: 0,
  },
  deleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  deleteOptionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  activateButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 48,
  },
  activateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

}); 