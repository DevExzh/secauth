import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
    ArrowLeft,
    Bell,
    ChevronRight,
    Clock,
    Link,
    Mail,
    Plus,
    RefreshCw,
    Settings,
    Shield,
    Trash2
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface EmailSettingsScreenProps {
  onBack: () => void;
  onConnectedAccounts: () => void;
  onAddAccount: () => void;
  onSyncFrequency: () => void;
}

export const EmailSettingsScreen: React.FC<EmailSettingsScreenProps> = ({
  onBack,
  onConnectedAccounts,
  onAddAccount,
  onSyncFrequency,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Settings state
  const [emailAutoSync, setEmailAutoSync] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDeleteEmails, setAutoDeleteEmails] = useState(true);
  const [secureConnection, setSecureConnection] = useState(true);

  // Mock data
  const connectedAccountsCount = 2;
  const currentSyncFrequency = '每小时';

  const settingsGroups = [
    {
      title: '账户管理',
      items: [
        {
          icon: <Link size={20} color={colors.primary} />,
          title: '已连接账户',
          subtitle: `${connectedAccountsCount} 个邮箱账户已连接`,
          type: 'navigation',
          onPress: onConnectedAccounts,
        },
        {
          icon: <Plus size={20} color={colors.primary} />,
          title: '添加邮箱账户',
          subtitle: '连接新的邮箱进行扫描',
          type: 'navigation',
          onPress: onAddAccount,
        },
      ],
    },
    {
      title: '同步设置',
      items: [
        {
          icon: <RefreshCw size={20} color={colors.primary} />,
          title: '自动同步',
          subtitle: '自动扫描新的验证邮件',
          type: 'switch',
          value: emailAutoSync,
          onToggle: setEmailAutoSync,
        },
        {
          icon: <Clock size={20} color={colors.primary} />,
          title: '同步频率',
          subtitle: currentSyncFrequency,
          type: 'navigation',
          onPress: onSyncFrequency,
          disabled: !emailAutoSync,
        },
      ],
    },
    {
      title: '邮件处理',
      items: [
        {
          icon: <Trash2 size={20} color={colors.primary} />,
          title: '自动删除邮件',
          subtitle: '处理后自动删除验证邮件',
          type: 'switch',
          value: autoDeleteEmails,
          onToggle: setAutoDeleteEmails,
        },
        {
          icon: <Bell size={20} color={colors.primary} />,
          title: '邮件通知',
          subtitle: '新账户检测和同步状态提醒',
          type: 'switch',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
      ],
    },
    {
      title: '安全设置',
      items: [
        {
          icon: <Shield size={20} color={colors.primary} />,
          title: '安全连接',
          subtitle: '使用加密连接访问邮箱',
          type: 'switch',
          value: secureConnection,
          onToggle: setSecureConnection,
        },
        {
          icon: <Settings size={20} color={colors.primary} />,
          title: '高级设置',
          subtitle: '邮件过滤和扫描规则',
          type: 'navigation',
          onPress: () => {
            // Navigate to advanced settings
            console.log('Navigate to advanced settings');
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[
        styles.settingItem, 
        { backgroundColor: colors.surface },
        item.disabled && styles.disabledItem
      ]}
      disabled={item.type === 'switch' || item.disabled}
      onPress={item.onPress}
    >
      <View style={[
        styles.settingIcon,
        item.disabled && { opacity: 0.5 }
      ]}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle, 
          { color: colors.text },
          item.disabled && { color: colors.textSecondary }
        ]}>
          {item.title}
        </Text>
        <Text style={[
          styles.settingSubtitle, 
          { color: colors.textSecondary },
          item.disabled && { opacity: 0.7 }
        ]}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.settingAction}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
            disabled={item.disabled}
          />
        ) : (
          <ChevronRight 
            size={20} 
            color={item.disabled ? colors.border : colors.textSecondary} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          邮箱设置
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
            <Mail size={32} color={colors.primary} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            邮箱集成设置
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            管理邮箱连接、同步设置和安全选项，自动扫描两步验证相关邮件。
          </Text>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.settingsGroup}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
              {group.title}
            </Text>
            <View style={[styles.groupContainer, { backgroundColor: colors.surface }]}>
              {group.items.map((item, itemIndex) => (
                <View key={item.title}>
                  {renderSettingItem(item)}
                  {itemIndex < group.items.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            同步状态
          </Text>
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                上次同步
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                2分钟前
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                扫描邮件数
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                156 封
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                发现账户数
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                12 个
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            关于邮箱扫描
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • 仅扫描包含两步验证信息的邮件{'\n'}
            • 不会读取或存储个人邮件内容{'\n'}
            • 所有连接都使用安全加密协议{'\n'}
            • 您可以随时断开邮箱连接
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
  },
  summarySection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  summaryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  groupContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  disabledItem: {
    opacity: 0.6,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingAction: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    marginLeft: 48,
  },
  statusSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    marginHorizontal: 16,
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