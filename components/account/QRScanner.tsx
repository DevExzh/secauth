import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Parse TOTP URL
    if (data.startsWith('otpauth://')) {
      onScan(data);
    } else {
      Alert.alert(
        t('qrScanner.invalidQR'),
        t('qrScanner.invalidQRMessage'),
        [
          {
            text: t('qrScanner.retry'),
            onPress: () => setScanned(false),
          },
          {
            text: t('qrScanner.cancel'),
            onPress: onClose,
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.text }]}>
          {t('qrScanner.requestingPermission')}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.text }]}>
          {t('qrScanner.permissionRequired')}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {t('qrScanner.grantPermission')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface, marginTop: 10 }]}
          onPress={onClose}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {t('qrScanner.back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={[styles.overlayTop, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
        
        {/* Middle section with scan area */}
        <View style={styles.overlayMiddle}>
          <View style={[styles.overlaySide, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          <View style={styles.scanArea}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
          </View>
          <View style={[styles.overlaySide, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
        </View>
        
        {/* Bottom overlay */}
        <View style={[styles.overlayBottom, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <Text style={[styles.instructionText, { color: colors.background }]}>
            {t('qrScanner.instruction')}
          </Text>
        </View>
      </View>

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <View style={[styles.closeButtonBackground, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <X size={24} color={colors.background} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: scanAreaSize,
  },
  overlaySide: {
    flex: 1,
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    position: 'relative',
  },
  overlayBottom: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  closeButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 