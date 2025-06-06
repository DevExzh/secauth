import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { Account } from '@/types/auth';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Copy } from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  const account: Account | null = params.account ? JSON.parse(params.account as string) : null;

  const handleClose = () => {
    router.back();
  };

  if (!account) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Account not found
        </Text>
      </View>
    );
  }

  // Generate QR code URL for the account
  const qrCodeUrl = `otpauth://totp/${encodeURIComponent(account.name)}?secret=${account.secret}&issuer=${encodeURIComponent(account.issuer || account.name)}`;

  const handleCopySecret = async () => {
    if (!account) return;
    
    try {
      await Clipboard.setStringAsync(account.secret);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), 'Secret key copied to clipboard');
    } catch (error) {
      console.error('Copy secret error:', error);
      Alert.alert(t('common.error'), 'Failed to copy secret key');
    }
  };

  const handleCopyQRData = async () => {
    if (!qrCodeUrl) return;
    
    try {
      await Clipboard.setStringAsync(qrCodeUrl);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), 'QR code data copied to clipboard');
    } catch (error) {
      console.error('Copy QR data error:', error);
      Alert.alert(t('common.error'), 'Failed to copy QR code data');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerButton} />
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('accountMenu.qrCodeTitle')}
        </Text>
        
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: colors.primary }]}>
            {t('common.done')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* QR Code */}
        <View style={[styles.qrCodeContainer, { backgroundColor: colors.surface }]}>
          <QRCode
            value={qrCodeUrl}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, { color: colors.text }]}>
            {account.name}
          </Text>
          {account.issuer && (
            <Text style={[styles.accountIssuer, { color: colors.textSecondary }]}>
              {account.issuer}
            </Text>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructions, { color: colors.textSecondary }]}>
            {t('accountMenu.qrCodeInstructions')}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
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
    textAlign: 'center',
  },
  accountIssuer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  instructionsContainer: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningContainer: {
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
}); 