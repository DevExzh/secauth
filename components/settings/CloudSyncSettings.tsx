import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
  ArrowLeft,
  Check,
  Cloud,
  HardDrive,
  Server,
  Wifi
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CloudSyncSettingsProps {
  onBack: () => void;
}

export const CloudSyncSettings: React.FC<CloudSyncSettingsProps> = ({ onBack }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncMethod, setSyncMethod] = useState<'webdav' | 'icloud' | 'google' | 'dropbox'>('webdav');
  const [webdavConfig, setWebdavConfig] = useState({
    url: '',
    username: '',
    password: '',
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSyncToggle = (enabled: boolean) => {
    setSyncEnabled(enabled);
    if (enabled && syncMethod === 'webdav' && !webdavConfig.url) {
      Alert.alert(t('cloudSync.configureFirst'));
    }
  };

  const handleTestConnection = async () => {
    if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
      Alert.alert(t('cloudSync.error'), t('cloudSync.fillAllFields'));
      return;
    }

    // Simulated connection test
    Alert.alert(t('cloudSync.testingConnection'), '', [{ text: t('common.confirm') }]);
    
    // Simulated WebDAV connection test with timeout
    setTimeout(() => {
      Alert.alert(t('cloudSync.connectionSuccessful'), t('cloudSync.webdav.name'));
    }, 1500);
  };

  const handleManualSync = async () => {
    if (!syncEnabled) {
      Alert.alert(t('cloudSync.enableSyncFirst'));
      return;
    }

    Alert.alert(t('cloudSync.syncing'), '', [{ text: t('common.confirm') }]);
    
    // Simulated sync process
    setTimeout(() => {
      setLastSync(new Date());
      Alert.alert(t('cloudSync.syncComplete'), t('cloudSync.syncCompleteMessage'));
    }, 2000);
  };

  const syncMethods = [
    {
      id: 'webdav' as const,
      name: t('cloudSync.webdav.name'),
      description: t('cloudSync.webdav.description'),
      icon: <Server size={24} color={colors.primary} />,
    },
    {
      id: 'icloud' as const,
      name: t('cloudSync.icloud.name'),
      description: t('cloudSync.icloud.description'),
      icon: <Cloud size={24} color={colors.primary} />,
    },
    {
      id: 'google' as const,
      name: t('cloudSync.google.name'),
      description: t('cloudSync.google.description'),
      icon: <HardDrive size={24} color={colors.primary} />,
    },
    {
      id: 'dropbox' as const,
      name: t('cloudSync.dropbox.name'),
      description: t('cloudSync.dropbox.description'),
      icon: <HardDrive size={24} color={colors.primary} />,
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('cloudSync.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Sync Toggle */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.syncToggle}>
            <View style={styles.syncInfo}>
              <Text style={[styles.syncTitle, { color: colors.text }]}>
                {t('cloudSync.enableSync')}
              </Text>
              <Text style={[styles.syncDescription, { color: colors.textSecondary }]}>
                {t('cloudSync.enableSyncDescription')}
              </Text>
            </View>
            <Switch
              value={syncEnabled}
              onValueChange={handleSyncToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        {/* Sync Method Selection */}
        {syncEnabled && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('cloudSync.syncMethod')}
            </Text>
            <View style={[styles.methodContainer, { backgroundColor: colors.surface }]}>
              {syncMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodItem,
                    syncMethod === method.id && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => setSyncMethod(method.id)}
                >
                  <View style={styles.methodIcon}>
                    {method.icon}
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodName, { color: colors.text }]}>
                      {method.name}
                    </Text>
                    <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                      {method.description}
                    </Text>
                  </View>
                  {syncMethod === method.id && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* WebDAV Configuration */}
        {syncEnabled && syncMethod === 'webdav' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('cloudSync.webdavConfig')}
            </Text>
            <View style={[styles.configContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('cloudSync.serverUrl')}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={webdavConfig.url}
                  onChangeText={(text) => setWebdavConfig({ ...webdavConfig, url: text })}
                  placeholder={t('cloudSync.serverUrlPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('cloudSync.username')}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={webdavConfig.username}
                  onChangeText={(text) => setWebdavConfig({ ...webdavConfig, username: text })}
                  placeholder={t('cloudSync.usernamePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('cloudSync.password')}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={webdavConfig.password}
                  onChangeText={(text) => setWebdavConfig({ ...webdavConfig, password: text })}
                  placeholder={t('cloudSync.passwordPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.primary }]}
                onPress={handleTestConnection}
              >
                <Wifi size={20} color={colors.background} />
                <Text style={[styles.testButtonText, { color: colors.background }]}>
                  {t('cloudSync.testConnection')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sync Status */}
        {syncEnabled && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('cloudSync.syncStatus')}
            </Text>
            <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: colors.text }]}>
                  {t('cloudSync.lastSyncTime')}
                </Text>
                <Text style={[styles.statusValue, { color: colors.textSecondary }]}>
                  {lastSync ? lastSync.toLocaleString() : t('cloudSync.neverSynced')}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.primary }]}
                onPress={handleManualSync}
              >
                <Cloud size={20} color={colors.background} />
                <Text style={[styles.syncButtonText, { color: colors.background }]}>
                  {t('cloudSync.syncNow')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* About Cloud Sync */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t('cloudSync.aboutSync')}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('cloudSync.aboutSyncDescription')}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 25 : 12,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  syncToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  syncDescription: {
    fontSize: 14,
  },
  methodContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  methodIcon: {
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 14,
  },
  configContainer: {
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusContainer: {
    borderRadius: 12,
    padding: 16,
  },
  statusItem: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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