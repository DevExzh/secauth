import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { Account } from '@/types/auth';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface EditNameModalProps {
  visible: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (accountId: string, newName: string) => void;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  visible,
  account,
  onClose,
  onSave,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update name when account changes
  React.useEffect(() => {
    if (account && visible) {
      setName(account.name);
    }
  }, [account, visible]);

  const handleSave = async () => {
    if (!account) return;
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(
        t('accountMenu.nameRequired'),
        t('accountMenu.nameRequiredMessage')
      );
      return;
    }

    try {
      setIsLoading(true);
      await onSave(account.id, trimmedName);
      
      Alert.alert(
        t('accountMenu.nameUpdated'),
        t('accountMenu.nameUpdatedMessage')
      );
      onClose();
    } catch (error) {
      console.error('Edit name error:', error);
      Alert.alert(
        t('accountMenu.nameUpdateError'),
        t('accountMenu.nameUpdateErrorMessage')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (account) {
      setName(account.name); // Reset to original name
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('accountMenu.editNameTitle')}
          </Text>
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.headerButton}
            disabled={isLoading}
          >
            <Text style={[
              styles.headerButtonText, 
              { 
                color: isLoading ? colors.textSecondary : colors.primary,
                fontWeight: '600'
              }
            ]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('accountMenu.editNameDescription')}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t('accountMenu.accountName')}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t('accountMenu.accountNamePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              autoFocus
              selectTextOnFocus
              maxLength={50}
              editable={!isLoading}
            />
          </View>

          {/* Account Info */}
          {account && (
            <View style={[styles.accountInfo, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.accountInfoLabel, { color: colors.textSecondary }]}>
                {t('add.manual.accountEmail')}
              </Text>
              <Text style={[styles.accountInfoValue, { color: colors.text }]}>
                {account.email}
              </Text>
            </View>
          )}
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
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  accountInfo: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  accountInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountInfoValue: {
    fontSize: 16,
  },
}); 