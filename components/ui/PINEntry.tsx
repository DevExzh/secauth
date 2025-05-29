import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

interface PINEntryProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  title?: string;
  subtitle?: string;
  maxAttempts?: number;
}

export function PINEntry({
  visible,
  onClose,
  onSuccess,
  onVerify,
  title,
  subtitle,
  maxAttempts = 3,
}: PINEntryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setPin('');
      setAttempts(0);
      setError('');
    }
  }, [visible]);

  const handleNumberPress = (number: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + number);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleVerify = async () => {
    if (pin.length !== 6) return;

    setIsVerifying(true);
    try {
      const isValid = await onVerify(pin);
      if (isValid) {
        onSuccess();
        setPin('');
        setAttempts(0);
        setError('');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        Vibration.vibrate(500);
        
        if (newAttempts >= maxAttempts) {
          setError(t('auth.pin.maxAttemptsReached'));
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setError(t('auth.pin.incorrectPin', { remaining: maxAttempts - newAttempts }));
        }
      }
    } catch (error) {
      setError(t('auth.pin.verificationError'));
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (pin.length === 6) {
      handleVerify();
    }
  }, [pin]);

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < pin.length ? colors.primary : 'transparent',
                borderColor: colors.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, itemIndex) => {
              if (item === '') {
                return <View key={itemIndex} style={styles.numberButton} />;
              }
              
              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[styles.numberButton, { backgroundColor: colors.surface }]}
                    onPress={handleBackspace}
                    disabled={pin.length === 0}
                  >
                    <Text style={[styles.backspaceText, { color: colors.text }]}>
                      ⌫
                    </Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={[styles.numberButton, { backgroundColor: colors.surface }]}
                  onPress={() => handleNumberPress(item)}
                  disabled={isVerifying}
                >
                  <Text style={[styles.numberText, { color: colors.text }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title || t('auth.pin.enterPin')}
          </Text>
          
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}

          {renderPinDots()}

          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          {renderNumberPad()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    minHeight: 20,
  },
  numberPad: {
    width: '100%',
    maxWidth: 300,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 24,
    fontWeight: '400',
  },
  backspaceText: {
    fontSize: 20,
  },
}); 