import { ConnectedAccountsScreen } from '@/components/ConnectedAccountsScreen';
import { EmailIntegrationScreen } from '@/components/EmailIntegrationScreen';
import { EmailParsingScreen } from '@/components/EmailParsingScreen';
import { EmailSettingsScreen } from '@/components/EmailSettingsScreen';
import { SyncFrequencyModal } from '@/components/SyncFrequencyModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Account } from '@/types/auth';
import {
  Bell,
  ChevronRight,
  Clock,
  Download,
  HelpCircle,
  Info,
  Link,
  Lock,
  Mail,
  MailCheck,
  Moon,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  Upload,
  User,
  Wifi
} from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [darkMode, setDarkMode] = React.useState(colorScheme === 'dark');
  const [notifications, setNotifications] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);
  const [showEmailIntegration, setShowEmailIntegration] = React.useState(false);
  const [showEmailParsing, setShowEmailParsing] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [showEmailSettings, setShowEmailSettings] = React.useState(false);
  const [showConnectedAccounts, setShowConnectedAccounts] = React.useState(false);
  const [showSyncFrequency, setShowSyncFrequency] = React.useState(false);
  
  // 旋转动画
  const spinValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (isScanning) {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();
    }
  }, [isScanning, spinValue]);
  
  // Email-related settings
  const [emailAutoSync, setEmailAutoSync] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [autoDeleteEmails, setAutoDeleteEmails] = React.useState(true);
  const [emailSyncFrequency, setEmailSyncFrequency] = React.useState('每小时');
  const [connectedEmailAccounts] = React.useState(2); // Mock connected accounts count

  const settingsGroups = [
    {
      title: '安全设置',
      items: [
        {
          icon: <Lock size={20} color={colors.primary} />,
          title: '生物识别解锁',
          subtitle: '使用指纹或面容ID解锁应用',
          type: 'switch',
          value: biometric,
          onToggle: setBiometric,
        },
        {
          icon: <Shield size={20} color={colors.primary} />,
          title: '自动锁定',
          subtitle: '5分钟后自动锁定应用',
          type: 'navigation',
        },
      ],
    },
    {
      title: '应用设置',
      items: [
        {
          icon: <Moon size={20} color={colors.primary} />,
          title: '深色模式',
          subtitle: '使用深色主题',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: <Bell size={20} color={colors.primary} />,
          title: '通知',
          subtitle: '接收验证码过期提醒',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: '邮箱设置',
      items: [
        {
          icon: <Mail size={20} color={colors.primary} />,
          title: '邮箱集成',
          subtitle: '邮箱连接和同步设置',
          type: 'navigation',
          onPress: () => setShowEmailSettings(true),
        },
        {
          icon: <Link size={20} color={colors.primary} />,
          title: '已连接账户',
          subtitle: `${connectedEmailAccounts} 个邮箱账户已连接`,
          type: 'navigation',
          onPress: () => setShowConnectedAccounts(true),
        },
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
          subtitle: emailSyncFrequency,
          type: 'navigation',
          onPress: () => setShowSyncFrequency(true),
        },
        {
          icon: <Trash2 size={20} color={colors.primary} />,
          title: '自动删除邮件',
          subtitle: '处理后自动删除验证邮件',
          type: 'switch',
          value: autoDeleteEmails,
          onToggle: setAutoDeleteEmails,
        },
        {
          icon: <MailCheck size={20} color={colors.primary} />,
          title: '邮件通知',
          subtitle: '新账户检测和同步状态提醒',
          type: 'switch',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
      ],
    },
    {
      title: '数据管理',
      items: [
        {
          icon: <Upload size={20} color={colors.primary} />,
          title: '导出数据',
          subtitle: '备份您的账户数据',
          type: 'navigation',
        },
        {
          icon: <Download size={20} color={colors.primary} />,
          title: '导入数据',
          subtitle: '从备份文件恢复数据',
          type: 'navigation',
        },
        {
          icon: <Wifi size={20} color={colors.primary} />,
          title: '云同步设置',
          subtitle: 'WebDAV 云端同步配置',
          type: 'navigation',
        },
      ],
    },
    {
      title: '帮助与支持',
      items: [
        {
          icon: <HelpCircle size={20} color={colors.primary} />,
          title: '帮助中心',
          subtitle: '常见问题和使用指南',
          type: 'navigation',
        },
        {
          icon: <Info size={20} color={colors.primary} />,
          title: '关于应用',
          subtitle: 'SecureAuth v1.0.0',
          type: 'navigation',
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      disabled={item.type === 'switch'}
      onPress={item.onPress}
    >
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
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
          />
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          个人资料
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <User size={32} color={colors.background} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              用户
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              user@example.com
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Settings size={20} color={colors.textSecondary} />
          </TouchableOpacity>
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

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            SecureAuth - 安全的两步验证应用
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            版本 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Email Settings Modal */}
      {showEmailSettings && (
        <View style={styles.fullScreenModal}>
          <EmailSettingsScreen
            onBack={() => setShowEmailSettings(false)}
            onConnectedAccounts={() => {
              setShowEmailSettings(false);
              setShowConnectedAccounts(true);
            }}
            onAddAccount={() => {
              setShowEmailSettings(false);
              setShowEmailIntegration(true);
            }}
            onSyncFrequency={() => {
              setShowEmailSettings(false);
              setShowSyncFrequency(true);
            }}
          />
        </View>
      )}

      {/* Connected Accounts Modal */}
      {showConnectedAccounts && (
        <View style={styles.fullScreenModal}>
          <ConnectedAccountsScreen
            onBack={() => setShowConnectedAccounts(false)}
            onAddAccount={() => {
              setShowConnectedAccounts(false);
              setShowEmailIntegration(true);
            }}
          />
        </View>
      )}

      {/* Email Integration Modal */}
      {showEmailIntegration && (
        <EmailIntegrationScreen
          onBack={() => setShowEmailIntegration(false)}
          onGrantAccess={async () => {
            setShowEmailIntegration(false);
            setIsScanning(true);
            
            // 模拟扫描过程
            setTimeout(() => {
              setIsScanning(false);
              setShowEmailParsing(true);
            }, 2000); // 2秒扫描动画
          }}
        />
      )}

      {/* Scanning Modal */}
      {isScanning && (
        <View style={[styles.scanningModal, { backgroundColor: colors.background }]}>
          <View style={styles.scanningContent}>
            <Text style={[styles.scanningTitle, { color: colors.text }]}>
              正在扫描邮件...
            </Text>
            <Text style={[styles.scanningSubtitle, { color: colors.textSecondary }]}>
              正在查找可用的两步验证账户
            </Text>
            {/* 旋转加载动画 */}
            <Animated.View 
              style={[
                styles.loadingIndicator, 
                { 
                  borderColor: colors.primary,
                  transform: [{
                    rotate: spinValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Email Parsing Modal */}
      {showEmailParsing && (
        <EmailParsingScreen
          onBack={() => setShowEmailParsing(false)}
          onActivate2FA={(accounts: Account[]) => {
            setShowEmailParsing(false);
            console.log('Activated 2FA for accounts:', accounts);
          }}
        />
      )}

      {/* Sync Frequency Modal */}
      <SyncFrequencyModal
        visible={showSyncFrequency}
        currentFrequency={emailSyncFrequency}
        onSelect={(frequency) => setEmailSyncFrequency(frequency)}
        onClose={() => setShowSyncFrequency(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  editButton: {
    padding: 8,
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
  },
  scanningModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scanningContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scanningTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  scanningSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
}); 