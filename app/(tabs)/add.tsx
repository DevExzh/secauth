import { EmailIntegrationScreen } from '@/components/EmailIntegrationScreen';
import { EmailParsingScreen } from '@/components/EmailParsingScreen';
import { QRScanner } from '@/components/QRScanner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Account, AccountCategory, AuthType } from '@/types/auth';
import { parseTOTPUrl } from '@/utils/totpParser';
import {
    ArrowLeft,
    Camera,
    Check,
    Mail,
    Plus,
    QrCode,
    Shield,
    Type
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AddScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [showManualForm, setShowManualForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showEmailIntegration, setShowEmailIntegration] = useState(false);
  const [showEmailParsing, setShowEmailParsing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    secret: '',
    type: 'TOTP' as AuthType,
    category: 'Other' as AccountCategory,
  });

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleQRScanResult = (data: string) => {
    setShowQRScanner(false);
    
    const parsedData = parseTOTPUrl(data);
    if (parsedData) {
      // Auto-fill form with scanned data
      setFormData({
        name: parsedData.name,
        email: parsedData.email,
        secret: parsedData.secret,
        type: parsedData.type,
        category: 'Other', // Will be determined automatically
      });
      setShowManualForm(true);
      
      Alert.alert(
        '扫描成功',
        `已识别账户：${parsedData.name}`,
        [{ text: '确定' }]
      );
    } else {
      Alert.alert(
        '扫描失败',
        '无法识别的二维码格式，请手动输入账户信息。',
        [
          { text: '手动输入', onPress: () => setShowManualForm(true) },
          { text: '重新扫描', onPress: () => setShowQRScanner(true) },
          { text: '取消' }
        ]
      );
    }
  };

  const handleQRScanClose = () => {
    setShowQRScanner(false);
  };

  const handleEmailImport = () => {
    setShowEmailIntegration(true);
  };

  const handleEmailIntegrationComplete = () => {
    setShowEmailIntegration(false);
    setShowEmailParsing(true);
  };

  const handleEmailParsingComplete = (accounts: Account[]) => {
    setShowEmailParsing(false);
    Alert.alert(
      '导入成功',
      `已成功导入 ${accounts.length} 个账户！`,
      [{ text: '确定' }]
    );
  };

  const handleManualAdd = () => {
    if (!formData.name || !formData.email || !formData.secret) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }
    
    Alert.alert(
      '添加成功',
      `账户 ${formData.name} 已添加成功！`,
      [
        {
          text: '确定',
          onPress: () => {
            setFormData({
              name: '',
              email: '',
              secret: '',
              type: 'TOTP',
              category: 'Other',
            });
            setShowManualForm(false);
          }
        }
      ]
    );
  };

  if (showManualForm) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowManualForm(false)}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            手动添加账户
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              服务名称 *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="例如：Google"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              账户邮箱 *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="example@gmail.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              密钥 *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={formData.secret}
              onChangeText={(text) => setFormData({ ...formData, secret: text })}
              placeholder="输入或粘贴密钥"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleManualAdd}
          >
            <Check size={20} color={colors.background} />
            <Text style={[styles.addButtonText, { color: colors.background }]}>
              添加账户
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            添加账户
          </Text>
          <View style={styles.placeholder} />
        </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.mainIcon, { backgroundColor: colors.primary }]}>
            <Shield size={48} color={colors.background} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          添加新的验证器账户
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          选择一种方式来添加您的两步验证账户
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, { 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }]}
            onPress={handleQRScan}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
              <QrCode size={24} color={colors.background} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                扫描二维码
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                扫描服务提供的QR码快速添加
              </Text>
            </View>
            <Camera size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }]}
            onPress={handleEmailImport}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
              <Mail size={24} color={colors.background} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                从邮件导入
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                自动扫描邮件中的验证账户
              </Text>
            </View>
            <Plus size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }]}
            onPress={() => setShowManualForm(true)}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
              <Type size={24} color={colors.background} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                手动输入
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                手动输入账户信息和密钥
              </Text>
            </View>
            <Plus size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <QRScanner
          onScan={handleQRScanResult}
          onClose={handleQRScanClose}
        />
      </Modal>

      {/* Email Integration Modal */}
      <Modal
        visible={showEmailIntegration}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <EmailIntegrationScreen
          onBack={() => setShowEmailIntegration(false)}
          onGrantAccess={handleEmailIntegrationComplete}
        />
      </Modal>

      {/* Email Parsing Modal */}
      <Modal
        visible={showEmailParsing}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <EmailParsingScreen
          onBack={() => setShowEmailParsing(false)}
          onActivate2FA={handleEmailParsingComplete}
        />
      </Modal>
    </>
  );
}

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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 