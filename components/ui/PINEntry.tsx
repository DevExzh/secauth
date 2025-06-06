import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useSmartSafeArea } from '@/hooks/useSafeArea';
import { Delete } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PINEntryProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  onVerify?: (pin: string) => Promise<boolean>;
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
  const { containerPadding } = useSmartSafeArea();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const resetState = () => {
    setPin('');
    setError('');
    setAttempts(0);
  };

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible]);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePinComplete = async (enteredPin: string) => {
    if (onVerify) {
      try {
        const isValid = await onVerify(enteredPin);
        if (isValid) {
          onSuccess(enteredPin);
          resetState();
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          
          if (newAttempts >= maxAttempts) {
            setError(t('auth.pin.maxAttemptsReached'));
            setTimeout(() => {
              resetState();
              onClose();
            }, 2000);
          } else {
            setError(t('auth.pin.incorrectPin', { remaining: maxAttempts - newAttempts }));
            shakeError();
            setPin('');
          }
        }
      } catch (err) {
        console.error('PIN verification error:', err);
        setError(t('auth.pin.verificationError'));
        shakeError();
        setPin('');
      }
    } else {
      onSuccess(enteredPin);
      resetState();
    }
  };

  const handleNumberPress = (number: string) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        setTimeout(() => handlePinComplete(newPin), 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const renderPinDots = () => (
    <Animated.View style={[
      styles.pinContainer,
      { transform: [{ translateX: shakeAnimation }] }
    ]}>
      {[...Array(4)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            {
              backgroundColor: index < pin.length ? colors.primary : colors.border,
              borderColor: colors.border,
            }
          ]}
        />
      ))}
    </Animated.View>
  );

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace']
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, colIndex) => {
              if (item === '') {
                return <View key={colIndex} style={styles.numberButton} />;
              }
              
              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.numberButton}
                    onPress={handleBackspace}
                    disabled={pin.length === 0}
                  >
                    <Delete size={24} color={pin.length > 0 ? colors.text : colors.textSecondary} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(item)}
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
      <View style={[styles.container, { backgroundColor: colors.background }, containerPadding]}>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80, // Reduced bottom padding
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  numberPad: {
    marginTop: 32,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  numberText: {
    fontSize: 28,
    fontWeight: '300',
  },
}); 