import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EmailService } from '@/services/emailService';
import { Account } from '@/types/auth';
import {
    ArrowLeft,
    Check,
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
}

export const EmailParsingScreen: React.FC<EmailParsingScreenProps> = ({ 
  onBack, 
  onActivate2FA 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
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
      const connectedAccounts = EmailService.getConnectedAccounts();
      if (connectedAccounts.length > 0) {
        const scannedAccounts = await EmailService.scanEmailsForAccounts(connectedAccounts[0]);
        setAccounts(scannedAccounts);
        // Select all accounts by default
        setSelectedAccounts(new Set(scannedAccounts.map(account => account.id)));
      }
    } catch (error) {
      Alert.alert('错误', '扫描邮件时发生错误');
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
      Alert.alert('提示', '请至少选择一个账户');
      return;
    }

    setIsActivating(true);
    try {
      const selectedAccountsList = accounts.filter(account => 
        selectedAccounts.has(account.id)
      );
      
      // Simulate activation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (deleteProcessedEmails) {
        await EmailService.deleteProcessedEmails(Array.from(selectedAccounts));
      }
      
      onActivate2FA(selectedAccountsList);
      Alert.alert('成功', '已成功激活选中账户的两步验证');
    } catch (error) {
      Alert.alert('错误', '激活过程中发生错误');
    } finally {
      setIsActivating(false);
    }
  };

  const renderAccountItem = (account: Account) => {
    const isSelected = selectedAccounts.has(account.id);
    
    return (
      <TouchableOpacity
        key={account.id}
        style={[styles.accountItem, { backgroundColor: colors.surface }]}
        onPress={() => toggleAccountSelection(account.id)}
      >
        <View style={styles.accountIcon}>
          <Shield size={20} color={colors.primary} />
        </View>
        <View style={styles.accountContent}>
          <Text style={[styles.accountName, { color: colors.text }]}>
            {account.name}
          </Text>
          <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
            {account.email}
          </Text>
        </View>
        <View style={[
          styles.checkbox,
          { 
            backgroundColor: isSelected ? colors.primary : 'transparent',
            borderColor: isSelected ? colors.primary : colors.border
          }
        ]}>
          {isSelected && <Check size={16} color={colors.background} />}
        </View>
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
          Email Parsing
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
                         We&apos;ve scanned your email for accounts that can be secured with two-factor authentication. Review the list below and activate 2FA for each account.
          </Text>
        </View>

        {/* Accounts List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Scanning emails...
            </Text>
          </View>
        ) : (
          <View style={styles.accountsList}>
            {accounts.map(renderAccountItem)}
          </View>
        )}

        {/* Delete Option */}
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
              Delete processed emails
            </Text>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        {!isLoading && accounts.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.activateButton, { backgroundColor: colors.primary }]}
              onPress={handleActivate2FA}
              disabled={isActivating || selectedAccounts.size === 0}
            >
              <Text style={[styles.activateButtonText, { color: colors.background }]}>
                {isActivating ? 'Activating...' : 'Activate 2FA'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secureButton, { borderColor: colors.primary }]}
              onPress={() => {
                // Navigate to secure connection settings
                Alert.alert('安全连接', '安全连接设置');
              }}
            >
              <Text style={[styles.secureButtonText, { color: colors.primary }]}>
                Secure Connection
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
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountEmail: {
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