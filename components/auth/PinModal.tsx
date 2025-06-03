import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { BiometricAuthService } from '@/services/biometricAuth';
import { Delete, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onPinSet?: () => void;
  mode?: 'set' | 'confirm' | 'verify';
  title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  visible,
  onClose,
  onPinSet,
  mode = 'set',
  title,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const maxAttempts = 5;
  const pinLength = 6;

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible]);

  const resetState = () => {
    setPin('');
    setConfirmPin('');
    setStep('enter');
    setAttempts(0);
    setIsLoading(false);
  };

  const handleNumberPress = (number: string) => {
    if (isLoading) return;

    if (step === 'enter') {
      if (pin.length < pinLength) {
        setPin(prev => prev + number);
      }
    } else {
      if (confirmPin.length < pinLength) {
        setConfirmPin(prev => prev + number);
      }
    }
  };

  const handleDelete = () => {
    if (isLoading) return;

    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    if (mode === 'set') {
      if (step === 'enter') {
        if (pin.length === pinLength) {
          setStep('confirm');
        }
      } else {
        if (confirmPin.length === pinLength) {
          if (pin === confirmPin) {
            try {
              await BiometricAuthService.setPIN(pin);
              Alert.alert(t('auth.pin.success'), t('auth.pin.successMessage'), [
                { text: t('common.ok'), onPress: () => {
                  onPinSet?.();
                  onClose();
                }}
              ]);
            } catch (error) {
              Alert.alert(t('common.error'), t('auth.pin.setError'));
              console.error(error);
            }
          } else {
            Vibration.vibrate(500);
            Alert.alert(t('auth.pin.mismatch'), t('auth.pin.mismatchMessage'));
            setConfirmPin('');
          }
        }
      }
    } else if (mode === 'verify') {
      if (pin.length === pinLength) {
        try {
          const isValid = await BiometricAuthService.verifyPIN(pin);
          if (isValid) {
            onPinSet?.();
            onClose();
          } else {
            Vibration.vibrate(500);
            setAttempts(prev => prev + 1);
            setPin('');
            
            if (attempts + 1 >= maxAttempts) {
              Alert.alert(
                t('auth.pin.maxAttemptsTitle'),
                t('auth.pin.maxAttemptsMessage'),
                [{ text: t('common.ok'), onPress: onClose }]
              );
            } else {
              Alert.alert(
                t('auth.pin.incorrect'),
                t('auth.pin.incorrectMessage', { remaining: maxAttempts - attempts - 1 })
              );
            }
          }
        } catch (error) {
          Alert.alert(t('common.error'), t('auth.pin.verifyError'));
          console.error(error);
        }
      }
    }

    setIsLoading(false);
  }, [mode, step, pin, confirmPin, pinLength, attempts, maxAttempts, t, onPinSet, onClose]);

  useEffect(() => {
    if ((step === 'enter' && pin.length === pinLength) || 
        (step === 'confirm' && confirmPin.length === pinLength)) {
      handleSubmit();
    }
  }, [pin, confirmPin, handleSubmit, step]);

  const getTitle = () => {
    if (title) return title;
    
    if (mode === 'set') {
      return step === 'enter' ? t('auth.pin.enterNew') : t('auth.pin.confirmNew');
    } else if (mode === 'verify') {
      return t('auth.pin.enterPin');
    }
    return t('auth.pin.title');
  };

  const getSubtitle = () => {
    if (mode === 'set') {
      return step === 'enter' 
        ? t('auth.pin.enterNewDescription') 
        : t('auth.pin.confirmNewDescription');
    } else if (mode === 'verify') {
      return attempts > 0 
        ? t('auth.pin.attemptsRemaining', { remaining: maxAttempts - attempts })
        : t('auth.pin.enterPinDescription');
    }
    return '';
  };

  const renderPinDots = () => {
    const currentPin = step === 'enter' ? pin : confirmPin;
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: pinLength }, (_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < currentPin.length ? colors.primary : 'transparent',
                borderColor: colors.primary,
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
      ['', '0', 'delete'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, itemIndex) => {
              if (item === '') {
                return <View key={itemIndex} style={styles.numberButton} />;
              }
              
              if (item === 'delete') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.numberButton}
                    onPress={handleDelete}
                    disabled={isLoading}
                  >
                    <Delete size={24} color={colors.text} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(item)}
                  disabled={isLoading}
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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {getTitle()}
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getSubtitle()}
          </Text>

          {renderPinDots()}
          {renderNumberPad()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
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
    marginBottom: 48,
    lineHeight: 22,
  },
  pinDotsContainer: {
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
  numberPad: {
    alignItems: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  numberButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  numberText: {
    fontSize: 32,
    fontWeight: '300',
  },
}); 