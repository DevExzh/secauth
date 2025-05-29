import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { Account } from '@/types/auth';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeModalProps {
  visible: boolean;
  account: Account | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  account,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const qrCodeData = useMemo(() => {
    if (!account) return '';
    
    // Generate TOTP URI format
    const issuer = account.issuer || account.name;
    const label = `${issuer}:${account.email}`;
    const secret = account.secret;
    
    return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }, [account]);

  const handleCopySecret = async () => {
    if (!account) return;
    
    try {
      await Clipboard.setStringAsync(account.secret);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), 'Secret key copied to clipboard');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to copy secret key');
    }
  };

  const handleCopyQRData = async () => {
    if (!qrCodeData) return;
    
    try {
      await Clipboard.setStringAsync(qrCodeData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), 'QR code data copied to clipboard');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to copy QR code data');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerButton} />
          
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('accountMenu.qrCodeTitle')}
          </Text>
          
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.primary }]}>
              {t('common.done')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('accountMenu.qrCodeDescription')}
          </Text>

          {/* Account Info */}
          {account && (
            <View style={[styles.accountInfo, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.accountName, { color: colors.text }]}>
                {account.name}
              </Text>
              <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
                {account.email}
              </Text>
            </View>
          )}

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View 
              style={[
                styles.qrCodeWrapper, 
                { backgroundColor: '#FFFFFF' }
              ]}
            >
              {qrCodeData && (
                <QRCode
                  value={qrCodeData}
                  size={240}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logo={undefined}
                  logoSize={30}
                  logoBackgroundColor="transparent"
                  logoMargin={2}
                  logoBorderRadius={15}
                  quietZone={10}
                />
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
              onPress={handleCopySecret}
            >
              <Copy size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Copy Secret
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
              onPress={handleCopyQRData}
            >
              <Copy size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Copy QR Data
              </Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View style={[styles.warningContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              ⚠️ Keep your QR code and secret key secure. Anyone with access to them can generate your verification codes.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  accountInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrCodeWrapper: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  warningContainer: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
}); 