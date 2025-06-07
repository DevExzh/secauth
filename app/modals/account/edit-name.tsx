import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { Account } from '@/types/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditNameScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  const account: Account | null = params.account ? JSON.parse(params.account as string) : null;
  const [newName, setNewName] = useState(account?.name || '');

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!account) return;
    
    if (newName.trim() === '') {
      Alert.alert(t('common.error'), t('accountMenu.nameCannotBeEmpty'));
      return;
    }

    if (newName.trim() === account.name) {
      handleClose();
      return;
    }

    // Note: In a real implementation, you would call the onSave callback
    // For now, we'll just close the modal
    Alert.alert(
      t('common.success'),
      t('accountMenu.nameUpdatedMessage'),
      [{ text: t('common.ok'), onPress: handleClose }]
    );
  };

  if (!account) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t('accountMenu.accountNotFound')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('accountMenu.editNameTitle')}
        </Text>
        
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('accountMenu.accountName')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={newName}
            onChangeText={setNewName}
            placeholder={t('accountMenu.accountNamePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            autoFocus
            selectTextOnFocus
          />
          
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            {t('accountMenu.editNameHelperText')}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
