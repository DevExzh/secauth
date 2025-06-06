import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { Account } from '@/types/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ViewEmailScreen() {
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
          {t('viewEmail.accountNotFound')}
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
          {t('viewEmail.title')}
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.emailContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('viewEmail.emailAddress')}
          </Text>
          <Text style={[styles.email, { color: colors.text }]}>
            {account.email || t('viewEmail.noEmail')}
          </Text>
        </View>

        <View style={[styles.accountInfo, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('viewEmail.accountName')}
          </Text>
          <Text style={[styles.accountName, { color: colors.text }]}>
            {account.name}
          </Text>
          
          {account.issuer && (
            <>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>
                {t('viewEmail.issuer')}
              </Text>
              <Text style={[styles.issuer, { color: colors.text }]}>
                {account.issuer}
              </Text>
            </>
          )}
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  emailContainer: {
    borderRadius: 12,
    padding: 16,
  },
  accountInfo: {
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '400',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  issuer: {
    fontSize: 16,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
}); 