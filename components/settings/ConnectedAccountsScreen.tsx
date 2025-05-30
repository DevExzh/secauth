import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
    ArrowLeft,
    CheckCircle,
    Mail,
    Plus,
    Trash2,
    Wifi,
    WifiOff
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ConnectedAccount {
  id: string;
  provider: string;
  email: string;
  isConnected: boolean;
  lastSync: string;
}

interface ConnectedAccountsScreenProps {
  onBack: () => void;
  onAddAccount: () => void;
}

export const ConnectedAccountsScreen: React.FC<ConnectedAccountsScreenProps> = ({ 
  onBack, 
  onAddAccount 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  // Mock connected accounts data
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      provider: 'Gmail',
      email: 'personal@gmail.com',
      isConnected: true,
      lastSync: t('connectedAccounts.lastSyncTimes.twoMinutesAgo'),
    },
    {
      id: '2',
      provider: 'Outlook',
      email: 'work@outlook.com',
      isConnected: true,
      lastSync: t('connectedAccounts.lastSyncTimes.fiveMinutesAgo'),
    },
    {
      id: '3',
      provider: 'Yahoo',
      email: 'backup@yahoo.com',
      isConnected: false,
      lastSync: t('connectedAccounts.lastSyncTimes.oneHourAgo'),
    },
  ]);

  const handleDisconnectAccount = (accountId: string, email: string) => {
    Alert.alert(
      t('connectedAccounts.disconnect.title'),
      t('connectedAccounts.disconnect.message', { email }),
      [
        { text: t('connectedAccounts.disconnect.cancel'), style: 'cancel' },
        {
          text: t('connectedAccounts.disconnect.confirm'),
          style: 'destructive',
          onPress: () => {
            setConnectedAccounts(prev => 
              prev.map(account => 
                account.id === accountId 
                  ? { ...account, isConnected: false }
                  : account
              )
            );
          },
        },
      ]
    );
  };

  const handleReconnectAccount = (accountId: string) => {
    setConnectedAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, isConnected: true, lastSync: t('connectedAccounts.lastSyncTimes.justNow') }
          : account
      )
    );
  };

  const getProviderIcon = (provider: string) => {
    // 这里可以根据不同的邮箱提供商返回不同的图标
    return <Mail size={24} color={colors.primary} />;
  };

  const renderAccountItem = (account: ConnectedAccount) => (
    <View key={account.id} style={[styles.accountItem, { backgroundColor: colors.surface }]}>
      <View style={styles.accountIcon}>
        {getProviderIcon(account.provider)}
      </View>
      
      <View style={styles.accountInfo}>
        <Text style={[styles.accountProvider, { color: colors.text }]}>
          {account.provider}
        </Text>
        <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
          {account.email}
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.statusIndicator}>
            {account.isConnected ? (
              <Wifi size={14} color={colors.primary} />
            ) : (
              <WifiOff size={14} color={colors.textSecondary} />
            )}
            <Text style={[
              styles.statusText, 
              { color: account.isConnected ? colors.primary : colors.textSecondary }
            ]}>
              {account.isConnected ? t('connectedAccounts.status.connected') : t('connectedAccounts.status.disconnected')}
            </Text>
          </View>
          <Text style={[styles.lastSyncText, { color: colors.textSecondary }]}>
            {t('connectedAccounts.lastSync', { time: account.lastSync })}
          </Text>
        </View>
      </View>

      <View style={styles.accountActions}>
        {account.isConnected ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.disconnectButton]}
            onPress={() => handleDisconnectAccount(account.id, account.email)}
          >
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.reconnectButton, { backgroundColor: colors.primary }]}
            onPress={() => handleReconnectAccount(account.id)}
          >
            <CheckCircle size={16} color={colors.background} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('connectedAccounts.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('connectedAccounts.subtitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('connectedAccounts.description')}
          </Text>
        </View>

        {/* Connected Accounts List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('connectedAccounts.connectedAccountsCount', { count: connectedAccounts.filter(a => a.isConnected).length })}
          </Text>
          
          <View style={styles.accountsList}>
            {connectedAccounts.map(renderAccountItem)}
          </View>
        </View>

        {/* Add Account Button */}
        <View style={styles.addAccountSection}>
          <TouchableOpacity
            style={[styles.addAccountButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onAddAccount}
          >
            <Plus size={24} color={colors.primary} />
            <Text style={[styles.addAccountText, { color: colors.primary }]}>
              {t('connectedAccounts.addAccount')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t('connectedAccounts.infoTitle')}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('connectedAccounts.infoDescription')}
          </Text>
        </View>
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
  summarySection: {
    paddingVertical: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  accountsList: {
    gap: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountProvider: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastSyncText: {
    fontSize: 12,
  },
  accountActions: {
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  reconnectButton: {
    // backgroundColor set dynamically
  },
  addAccountSection: {
    marginBottom: 24,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  addAccountText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 