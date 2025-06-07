import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import {
    ArrowLeft,
    CheckCircle,
    ChevronRight,
    Download,
    FileText,
    Plus,
    Shield,
    ShieldAlert,
    ShieldCheck,
    XCircle
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'revoked';
  type: 'root' | 'intermediate' | 'server';
  fingerprint: string;
}

export default function EmailCertificateManagementModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  // Mock certificate data
  const [certificates] = useState<Certificate[]>([
    {
      id: '1',
      name: 'Let\'s Encrypt Authority X3',
      issuer: 'Let\'s Encrypt',
      expiryDate: '2025-03-17',
      status: 'valid',
      type: 'root',
      fingerprint: 'A1:B2:C3:D4:E5:F6'
    },
    {
      id: '2',
      name: 'Gmail SMTP Certificate',
      issuer: 'Google Trust Services',
      expiryDate: '2024-12-15',
      status: 'valid',
      type: 'server',
      fingerprint: 'F1:E2:D3:C4:B5:A6'
    },
    {
      id: '3',
      name: 'Outlook Certificate',
      issuer: 'Microsoft Corporation',
      expiryDate: '2024-02-10',
      status: 'expired',
      type: 'server',
      fingerprint: '11:22:33:44:55:66'
    }
  ]);

  const handleImportCertificate = () => {
    Alert.alert(
      t('emailCertificateManagement.importCertificate.title'),
      t('emailCertificateManagement.importCertificate.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('emailCertificateManagement.importCertificate.fromFile'), onPress: importFromFile },
        { text: t('emailCertificateManagement.importCertificate.fromServer'), onPress: importFromServer }
      ]
    );
  };

  const importFromFile = () => {
    Alert.alert(
      t('emailCertificateManagement.importFromFile.title'),
      t('emailCertificateManagement.importFromFile.message')
    );
  };

  const importFromServer = () => {
    Alert.alert(
      t('emailCertificateManagement.importFromServer.title'),
      t('emailCertificateManagement.importFromServer.message')
    );
  };

  const handleExportCertificates = () => {
    Alert.alert(
      t('emailCertificateManagement.exportCertificates.title'),
      t('emailCertificateManagement.exportCertificates.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.export'), onPress: performExport }
      ]
    );
  };

  const performExport = () => {
    Alert.alert(
      t('emailCertificateManagement.exportSuccess.title'),
      t('emailCertificateManagement.exportSuccess.message')
    );
  };

  const handleCertificateDetails = (certificate: Certificate) => {
    Alert.alert(
      certificate.name,
      `${t('emailCertificateManagement.certificateDetails.issuer')}: ${certificate.issuer}\n${t('emailCertificateManagement.certificateDetails.expiry')}: ${certificate.expiryDate}\n${t('emailCertificateManagement.certificateDetails.fingerprint')}: ${certificate.fingerprint}`,
      [
        { text: t('common.close'), style: 'cancel' },
        { text: t('emailCertificateManagement.certificateDetails.revoke'), style: 'destructive', onPress: () => revokeCertificate(certificate.id) }
      ]
    );
  };

  const revokeCertificate = (certificateId: string) => {
    Alert.alert(
      t('emailCertificateManagement.revokeCertificate.title'),
      t('emailCertificateManagement.revokeCertificate.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => {
          Alert.alert(t('emailCertificateManagement.revokeSuccess.title'), t('emailCertificateManagement.revokeSuccess.message'));
        }}
      ]
    );
  };

  const getStatusIcon = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle size={16} color={colors.success} />;
      case 'expired':
        return <XCircle size={16} color={colors.error} />;
      case 'revoked':
        return <ShieldAlert size={16} color={colors.warning} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return t('emailCertificateManagement.status.valid');
      case 'expired':
        return t('emailCertificateManagement.status.expired');
      case 'revoked':
        return t('emailCertificateManagement.status.revoked');
      default:
        return '';
    }
  };

  const getTypeIcon = (type: Certificate['type']) => {
    switch (type) {
      case 'root':
        return <Shield size={16} color={colors.primary} />;
      case 'intermediate':
        return <ShieldCheck size={16} color={colors.primary} />;
      case 'server':
        return <FileText size={16} color={colors.primary} />;
      default:
        return null;
    }
  };

  const renderCertificate = (certificate: Certificate) => (
    <TouchableOpacity
      key={certificate.id}
      style={[styles.certificateItem, { backgroundColor: colors.surface }]}
      onPress={() => handleCertificateDetails(certificate)}
    >
      <View style={styles.certificateIcon}>
        {getTypeIcon(certificate.type)}
      </View>
      <View style={styles.certificateContent}>
        <Text style={[styles.certificateName, { color: colors.text }]}>
          {certificate.name}
        </Text>
        <Text style={[styles.certificateIssuer, { color: colors.textSecondary }]}>
          {certificate.issuer}
        </Text>
        <View style={styles.certificateStatus}>
          {getStatusIcon(certificate.status)}
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {getStatusText(certificate.status)} • {certificate.expiryDate}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const actionButtons = [
    {
      icon: <Plus size={20} color={colors.primary} />,
      title: t('emailCertificateManagement.importCertificate.title'),
      subtitle: t('emailCertificateManagement.importCertificate.subtitle'),
      onPress: handleImportCertificate,
    },
    {
      icon: <Download size={20} color={colors.primary} />,
      title: t('emailCertificateManagement.exportCertificates.title'),
      subtitle: t('emailCertificateManagement.exportCertificates.subtitle'),
      onPress: handleExportCertificates,
    }
  ];

  const validCertificates = certificates.filter(cert => cert.status === 'valid');
  const expiredCertificates = certificates.filter(cert => cert.status === 'expired');
  const revokedCertificates = certificates.filter(cert => cert.status === 'revoked');

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {t('emailCertificateManagement.title')}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SmartScreen style={{ backgroundColor: colors.background }}>
      {renderHeader()}
      <ScrollView style={styles.content}>
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
            <ShieldCheck size={32} color={colors.primary} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('emailCertificateManagement.summaryTitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('emailCertificateManagement.summaryDescription')}
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {validCertificates.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('emailCertificateManagement.stats.valid')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {expiredCertificates.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('emailCertificateManagement.stats.expired')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {revokedCertificates.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('emailCertificateManagement.stats.revoked')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('emailCertificateManagement.actions.title')}
          </Text>
          <View style={[styles.actionsContainer, { backgroundColor: colors.surface }]}>
            {actionButtons.map((action, index) => (
              <View key={action.title}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={action.onPress}
                >
                  <View style={styles.actionIcon}>
                    {action.icon}
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      {action.title}
                    </Text>
                    <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                      {action.subtitle}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {index < actionButtons.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Certificates List */}
        <View style={styles.certificatesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('emailCertificateManagement.certificates.title')}
          </Text>
          <View style={[styles.certificatesContainer, { backgroundColor: colors.surface }]}>
            {certificates.map((certificate, index) => (
              <View key={certificate.id}>
                {renderCertificate(certificate)}
                {index < certificates.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securitySection}>
          <View style={[styles.securityCard, { backgroundColor: colors.surface, borderColor: colors.warning + '40' }]}>
            <ShieldAlert size={24} color={colors.warning} style={styles.securityIcon} />
            <View style={styles.securityContent}>
              <Text style={[styles.securityTitle, { color: colors.text }]}>
                {t('emailCertificateManagement.security.title')}
              </Text>
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                {t('emailCertificateManagement.security.description')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SmartScreen>
  );
}

const styles = StyleSheet.create({
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  actionsContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  certificatesSection: {
    marginBottom: 24,
  },
  certificatesContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  certificateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  certificateIcon: {
    marginRight: 12,
  },
  certificateContent: {
    flex: 1,
  },
  certificateName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  certificateIssuer: {
    fontSize: 14,
    marginBottom: 4,
  },
  certificateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
  },
  separator: {
    height: 1,
    marginLeft: 48,
  },
  securitySection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  securityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 