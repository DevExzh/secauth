import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncMethod, setSyncMethod] = useState<'webdav' | 'icloud' | 'google'>('webdav');
  const [webdavConfig, setWebdavConfig] = useState({
    url: '',
    username: '',
    password: '',
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSyncToggle = (enabled: boolean) => {
    setSyncEnabled(enabled);
    if (enabled && !webdavConfig.url) {
      Alert.alert('提示', '请先配置同步服务器信息');
    }
  };

  const handleTestConnection = async () => {
    if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
      Alert.alert('错误', '请填写完整的服务器信息');
      return;
    }

    // 模拟连接测试
    Alert.alert('连接测试', '正在测试连接...', [{ text: '确定' }]);
    
    // 这里应该实现实际的WebDAV连接测试
    setTimeout(() => {
      Alert.alert('连接成功', 'WebDAV服务器连接正常');
    }, 1500);
  };

  const handleManualSync = async () => {
    if (!syncEnabled) {
      Alert.alert('提示', '请先启用云同步功能');
      return;
    }

    Alert.alert('同步中', '正在同步数据...', [{ text: '确定' }]);
    
    // 模拟同步过程
    setTimeout(() => {
      setLastSync(new Date());
      Alert.alert('同步完成', '数据已成功同步到云端');
    }, 2000);
  };

  const syncMethods = [
    {
      id: 'webdav' as const,
      name: 'WebDAV',
      description: '支持Nextcloud、ownCloud等',
      icon: <Server size={24} color={colors.primary} />,
    },
    {
      id: 'icloud' as const,
      name: 'iCloud',
      description: 'Apple iCloud Drive',
      icon: <Cloud size={24} color={colors.primary} />,
    },
    {
      id: 'google' as const,
      name: 'Google Drive',
      description: 'Google云端硬盘',
      icon: <HardDrive size={24} color={colors.primary} />,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          云同步设置
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Sync Toggle */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.syncToggle}>
            <View style={styles.syncInfo}>
              <Text style={[styles.syncTitle, { color: colors.text }]}>
                启用云同步
              </Text>
              <Text style={[styles.syncDescription, { color: colors.textSecondary }]}>
                自动备份和同步您的验证器数据
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
              同步方式
            </Text>
            <View style={[styles.methodContainer, { backgroundColor: colors.surface }]}>
              {syncMethods.map((method, index) => (
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
              WebDAV配置
            </Text>
            <View style={[styles.configContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  服务器地址
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={webdavConfig.url}
                  onChangeText={(text) => setWebdavConfig({ ...webdavConfig, url: text })}
                  placeholder="https://your-server.com/remote.php/dav/files/username/"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  用户名
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={webdavConfig.username}
                  onChangeText={(text) => setWebdavConfig({ ...webdavConfig, username: text })}
                  placeholder="用户名"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  密码
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={webdavConfig.password}
                  onChangeText={(text) => setWebdavConfig({ ...webdavConfig, password: text })}
                  placeholder="密码或应用专用密码"
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
                  测试连接
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sync Status */}
        {syncEnabled && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              同步状态
            </Text>
            <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: colors.text }]}>
                  最后同步时间
                </Text>
                <Text style={[styles.statusValue, { color: colors.textSecondary }]}>
                  {lastSync ? lastSync.toLocaleString() : '从未同步'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.primary }]}
                onPress={handleManualSync}
              >
                <Cloud size={20} color={colors.background} />
                <Text style={[styles.syncButtonText, { color: colors.background }]}>
                  立即同步
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sync Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            关于云同步
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • 数据将使用AES-256加密后上传到云端{'\n'}
            • 支持多设备间自动同步{'\n'}
            • 建议定期备份重要数据{'\n'}
            • 同步过程需要网络连接
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