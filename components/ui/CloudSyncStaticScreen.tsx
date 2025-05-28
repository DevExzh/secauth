import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CloudSyncStaticScreenProps {
  onClose?: () => void; // Optional close handler
}

export default function CloudSyncStaticScreen({ onClose }: CloudSyncStaticScreenProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const currentColors = Colors[colorScheme];

  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCloud, setSelectedCloud] = useState<'google' | 'dropbox' | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentColors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? 25 : 44,
      paddingBottom: 16,
      backgroundColor: currentColors.background,
      borderBottomWidth: 1,
      borderBottomColor: currentColors.border,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    backArrow: {
      fontSize: 24,
      color: currentColors.text,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: currentColors.text,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: currentColors.text,
      marginTop: 24,
      marginBottom: 12,
    },
    input: {
      backgroundColor: currentColors.surface,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: currentColors.text,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    cloudRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      padding: 12,
      borderRadius: 10,
      backgroundColor: currentColors.surface,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    selectedCloudRow: {
      borderColor: currentColors.primary,
      backgroundColor: colorScheme === 'dark' ? currentColors.tint + '30' : currentColors.primary + '10',
    },
    cloudIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: currentColors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    selectedCloudIconCircle: {
      backgroundColor: currentColors.primary,
    },
    cloudIcon: {
      fontSize: 24,
      color: colorScheme === 'dark' && selectedCloud === 'google' ? currentColors.background : currentColors.text,
    },
    cloudLabel: {
      fontSize: 18,
      color: currentColors.text,
      fontWeight: '500',
    },
    cloudStatus: {
      fontSize: 14,
      color: currentColors.textSecondary || currentColors.text,
    },
    syncButton: {
      backgroundColor: currentColors.primary,
      borderRadius: 10,
      marginHorizontal: 20,
      marginVertical: 16,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    syncButtonText: {
      color: Colors.dark.text,
      fontSize: 18,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cloud Sync</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* WebDAV Section */}
        <Text style={styles.sectionTitle}>WebDAV</Text>
        <TextInput 
          style={styles.input}
          placeholder="Server URL" 
          placeholderTextColor={currentColors.textSecondary || Colors.light.textSecondary}
          value={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Username" 
          placeholderTextColor={currentColors.textSecondary || Colors.light.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          placeholderTextColor={currentColors.textSecondary || Colors.light.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
          autoCapitalize="none"
        />

        {/* Cloud Storage Section */}
        <Text style={styles.sectionTitle}>Cloud Storage</Text>
        <TouchableOpacity onPress={() => setSelectedCloud('google')} activeOpacity={0.7}>
          <View style={[styles.cloudRow, selectedCloud === 'google' && styles.selectedCloudRow]}>
            <View style={[styles.cloudIconCircle, selectedCloud === 'google' && styles.selectedCloudIconCircle]}>
              <Text style={[styles.cloudIcon, selectedCloud === 'google' && { color: Colors.dark.text} ]}>G</Text>
            </View>
            <View>
              <Text style={styles.cloudLabel}>Google Drive</Text>
              <Text style={styles.cloudStatus}>{selectedCloud === 'google' ? 'Selected' : 'Not connected'}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedCloud('dropbox')} activeOpacity={0.7}>
          <View style={[styles.cloudRow, selectedCloud === 'dropbox' && styles.selectedCloudRow]}>
            <View style={[styles.cloudIconCircle, selectedCloud === 'dropbox' && styles.selectedCloudIconCircle]}>
              <Text style={[styles.cloudIcon, selectedCloud === 'dropbox' && { color: Colors.dark.text} ]}>▦</Text>
            </View>
            <View>
              <Text style={styles.cloudLabel}>Dropbox</Text>
              <Text style={styles.cloudStatus}>{selectedCloud === 'dropbox' ? 'Selected' : 'Not connected'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Sync Status Section */}
        <Text style={styles.sectionTitle}>Sync Status</Text>
        <View style={styles.cloudRow}>
          <View style={styles.cloudIconCircle}><Text style={styles.cloudIcon}>☁️</Text></View>
          <View>
            <Text style={styles.cloudLabel}>Sync Status</Text>
            <Text style={styles.cloudStatus}>Last synced: Never</Text>
          </View>
        </View>
      </ScrollView>
      {/* Sync Now Button */}
      <TouchableOpacity style={styles.syncButton} onPress={() => console.log('Sync Now pressed', { serverUrl, username, password, selectedCloud })}>
        <Text style={styles.syncButtonText}>Sync Now</Text>
      </TouchableOpacity>
    </View>
  );
} 