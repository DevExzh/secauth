import { ContextMenu } from '@/components/ui/ContextMenu';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { BrandIconService } from '@/services/brandIconService';
import { OTPService } from '@/services/otpService';
import type { Account, GeneratedCode } from '@/types/auth';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  Building2,
  Clock,
  Copy,
  CreditCard,
  Gamepad2,
  Github,
  Mail,
  MessageCircle,
  MoreVertical,
  Shield,
  Trash2
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface AccountCardProps {
  account: Account;
  onAccountUpdate?: (accountId: string, newName: string) => void;
  onAccountDelete?: (accountId: string) => void;
  onLongPress?: () => void;
  isDragging?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ 
  account, 
  onAccountUpdate,
  onAccountDelete,
  onLongPress,
  isDragging = false
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [currentAccount, setCurrentAccount] = useState<Account>(account);
  const [codeGeneratedAt, setCodeGeneratedAt] = useState<number>(0);
  const [hasGeneratedTempCode, setHasGeneratedTempCode] = useState(false);
  
  const progressValue = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Update local account state when account prop changes
  useEffect(() => {
    setCurrentAccount(account);
    // Reset temp code flag when account changes
    setHasGeneratedTempCode(false);
  }, [account]);

  // Check if account is expired
  const isExpired = useCallback(() => {
    if (!currentAccount.isTemporary || !currentAccount.expiresAt) return false;
    // Ensure expiresAt is a Date object
    const expiresAt = currentAccount.expiresAt instanceof Date 
      ? currentAccount.expiresAt 
      : new Date(currentAccount.expiresAt);
    return new Date() > expiresAt;
  }, [currentAccount]);

  // Calculate remaining time for temporary accounts
  const getRemainingTime = useCallback(() => {
    if (!currentAccount.isTemporary || !currentAccount.expiresAt) return null;
    const now = new Date();
    // Ensure expiresAt is a Date object
    const expiresAt = currentAccount.expiresAt instanceof Date 
      ? currentAccount.expiresAt 
      : new Date(currentAccount.expiresAt);
    const timeDiff = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(timeDiff / 1000)); // Return seconds
  }, [currentAccount]);

  // Check if current code is expired for non-temporary accounts
  const isCodeExpired = useCallback(() => {
    if (currentAccount.isTemporary) return false;
    if (!generatedCode || !codeGeneratedAt) return true;
    
    const now = Date.now();
    const codeAge = Math.floor((now - codeGeneratedAt) / 1000);
    return codeAge >= generatedCode.period;
  }, [currentAccount.isTemporary, generatedCode, codeGeneratedAt]);

  // Calculate current time remaining for the code
  const getCurrentTimeRemaining = useCallback(() => {
    if (currentAccount.isTemporary) {
      return getRemainingTime() || 0;
    }
    
    if (!generatedCode || !codeGeneratedAt) return 0;
    
    const now = Date.now();
    const codeAge = Math.floor((now - codeGeneratedAt) / 1000);
    return Math.max(0, generatedCode.period - codeAge);
  }, [currentAccount.isTemporary, generatedCode, codeGeneratedAt, getRemainingTime]);

  const generateNewCode = useCallback(async () => {
    try {
      // If account is expired, show expired message
      if (isExpired()) {
        setGeneratedCode({
          code: t('account.expired'),
          timeRemaining: 0,
          period: 30,
        });
        progressValue.value = withTiming(0, { duration: 300 });
        return;
      }

      // For temporary accounts, only generate code once
      if (currentAccount.isTemporary) {
        if (hasGeneratedTempCode) {
          return; // Already generated, don't generate again
        }
        
        const code = await OTPService.generateCode(currentAccount);
        const remainingTime = getRemainingTime() || 0;
        const totalPeriod = Math.max(remainingTime, 1);
        
        setGeneratedCode({
          ...code,
          timeRemaining: remainingTime,
          period: totalPeriod,
        });
        setCodeGeneratedAt(Date.now());
        setHasGeneratedTempCode(true);
        
        const currentProgress = remainingTime / totalPeriod;
        progressValue.value = withTiming(currentProgress, { duration: 300 });
        return;
      }

      // For non-temporary accounts, generate new code
      const code = await OTPService.generateCode(currentAccount);
      setGeneratedCode(code);
      setCodeGeneratedAt(Date.now());
      
      // Calculate current progress and smoothly animate to it
      const currentProgress = code.timeRemaining / code.period;
      progressValue.value = withTiming(currentProgress, { duration: 300 });
    } catch (error) {
      console.error('Error generating code:', error);
      // Set a placeholder code
      const placeholderCode = '--- ---';
      setGeneratedCode({
        code: placeholderCode,
        timeRemaining: 30,
        period: 30,
      });
      setCodeGeneratedAt(Date.now());
      progressValue.value = withTiming(1, { duration: 300 });
    }
  }, [currentAccount, progressValue, isExpired, getRemainingTime, t, hasGeneratedTempCode]);

  const updateProgress = useCallback(() => {
    if (!generatedCode) return;

    const timeRemaining = getCurrentTimeRemaining();
    const period = generatedCode.period;
    
    // Update the timeRemaining in the generatedCode state
    setGeneratedCode(prev => prev ? { ...prev, timeRemaining } : null);
    
    // Update progress animation
    const currentProgress = timeRemaining / period;
    progressValue.value = withTiming(currentProgress, { duration: 100 });
  }, [generatedCode, getCurrentTimeRemaining, progressValue]);

  // Initial code generation
  useEffect(() => {
    generateNewCode();
  }, [generateNewCode, currentAccount.id]); // Only regenerate when account changes

  // Setup timers for code updates and progress updates
  useEffect(() => {
    if (!generatedCode) return;

    let progressInterval: number;
    let codeTimeout: number;

    // For temporary accounts, only update progress
    if (currentAccount.isTemporary) {
      progressInterval = setInterval(updateProgress, 1000);
    } else {
      // For non-temporary accounts, update progress every second
      progressInterval = setInterval(updateProgress, 1000);
      
      // Set timeout to regenerate code when it expires
      const timeRemaining = getCurrentTimeRemaining();
      if (timeRemaining > 0) {
        codeTimeout = setTimeout(() => {
          generateNewCode();
        }, timeRemaining * 1000);
      } else if (isCodeExpired()) {
        // If code is already expired, generate immediately
        generateNewCode();
      }
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (codeTimeout) clearTimeout(codeTimeout);
    };
  }, [generatedCode, currentAccount.isTemporary, updateProgress, generateNewCode, getCurrentTimeRemaining, isCodeExpired]);

  const handleCopyCode = useCallback(async () => {
    if (generatedCode && generatedCode.code !== t('account.expired')) {
      await Clipboard.setStringAsync(generatedCode.code.replace(' ', ''));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('account.copied'), t('account.copiedMessage'));
    }
  }, [generatedCode, t]);

  const handleMenuPress = useCallback((event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setShowContextMenu(true);
  }, []);

  const handleEditName = useCallback(() => {
    router.push({
      pathname: '/modals/account/edit-name',
      params: {
        account: JSON.stringify(currentAccount)
      }
    } as any);
  }, [currentAccount]);

  const handleShowQRCode = useCallback(() => {
    router.push({
      pathname: '/modals/account/qr-code',
      params: {
        account: JSON.stringify(currentAccount)
      }
    } as any);
  }, [currentAccount]);

  const handleViewEmail = useCallback(() => {
    router.push({
      pathname: '/modals/account/view-email', 
      params: {
        account: JSON.stringify(currentAccount)
      }
    } as any);
  }, [currentAccount]);

  // Note: handleSaveName is available for future use when name editing is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveName = useCallback(async (accountId: string, newName: string) => {
    try {
      // Update local state immediately for instant feedback
      setCurrentAccount(prev => ({ ...prev, name: newName }));
      
      // Call the parent callback to update the account in storage
      if (onAccountUpdate) {
        await onAccountUpdate(accountId, newName);
      }
    } catch (error) {
      // Revert local state if update fails
      setCurrentAccount(account);
      throw error;
    }
  }, [onAccountUpdate, account]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('account.deleteTitle'),
      t('account.deleteMessage', { name: currentAccount.name }),
      [
        { text: t('account.cancel'), style: 'cancel' },
        {
          text: t('account.delete'),
          style: 'destructive',
          onPress: () => {
            if (onAccountDelete) {
              onAccountDelete(currentAccount.id);
            }
          },
        },
      ]
    );
  }, [currentAccount, onAccountDelete, t]);

  // Handle long press for drag and drop (simplified approach)
  const handleLongPress = useCallback(() => {
    if (!currentAccount.isTemporary && !isExpired() && onLongPress) {
      onLongPress();
    }
  }, [currentAccount.isTemporary, isExpired, onLongPress]);

  // Pan gesture for swipe to delete (only for temporary accounts)
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(currentAccount.isTemporary || isExpired())
      .activeOffsetX([-10, 10]) // Only activate when horizontal movement > 10px
      .failOffsetY([-20, 20]) // Fail if vertical movement > 20px (allow list scrolling)
      .onUpdate((event) => {
        // Only allow left swipe (negative translateX)
        if (event.translationX < 0) {
          translateX.value = Math.max(event.translationX, -120);
        }
      })
      .onEnd((event) => {
        if (event.translationX < -80) {
          // Swipe threshold reached, show delete confirmation
          translateX.value = withSpring(0);
          runOnJS(handleDelete)();
        } else {
          // Return to original position
          translateX.value = withSpring(0);
        }
      });
  }, [currentAccount.isTemporary, isExpired, translateX, handleDelete]);

  // 添加发光效果的阴影样式
  const glowStyle = useAnimatedStyle(() => {
    if (!isDragging) return { opacity: 0 };
    
    return {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: 20,
      backgroundColor: colors.primary + '10',
      shadowColor: colors.primary,
      shadowOffsetWidth: 0,
      shadowOffsetHeight: 0,
      shadowOpacity: withTiming(0.6, { duration: 150 }),
      shadowRadius: withTiming(16, { duration: 150 }),
      elevation: 8,
      zIndex: -1,
      opacity: withTiming(1, { duration: 150 }),
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: withSpring(isDragging ? 1.02 : 1, { damping: 15, stiffness: 300 }) }
      ],
      opacity: withTiming(isDragging ? 0.98 : opacity.value, { duration: 150 }),
      elevation: isDragging ? 12 : 4,
      shadowOpacity: withTiming(isDragging ? 0.2 : 0.1, { duration: 150 }),
      shadowRadius: withTiming(isDragging ? 16 : 8, { duration: 150 }),
      shadowOffsetWidth: 0,
      shadowOffsetHeight: isDragging ? 8 : 4,
      shadowColor: isDragging ? colors.primary : '#000000',
    };
  });

  const getServiceIcon = (serviceName: string) => {
    const iconSize = 24;

    // 首先尝试使用品牌图标服务
    const matchedBrand = BrandIconService.matchServiceName(serviceName);
    
    if (matchedBrand) {
      const brandIcon = BrandIconService.getBrandIcon(matchedBrand, iconSize);
      if (brandIcon) {
        return brandIcon;
      }
    }

    // 如果没有品牌图标，使用lucide图标作为备选
    switch (serviceName.toLowerCase()) {
      case 'google':
        return <Mail size={iconSize} color="#EA4335" />;
      case 'microsoft':
        return <Building2 size={iconSize} color="#00A4EF" />;
      case 'github':
        return <Github size={iconSize} color={colorScheme === 'dark' ? '#F0F6FF' : '#181717'} />;
      case 'discord':
        return <MessageCircle size={iconSize} color="#5865F2" />;
      case 'paypal':
        return <CreditCard size={iconSize} color="#003087" />;
      case 'steam':
        return <Gamepad2 size={iconSize} color={colorScheme === 'dark' ? '#66C0F4' : '#1B2838'} />;
      default:
        return <Shield size={iconSize} color={colors.primary} />;
    }
  };

  const getServiceIconBackground = (serviceName: string) => {
    // 首先尝试使用品牌背景色
    const matchedBrand = BrandIconService.matchServiceName(serviceName);
    if (matchedBrand) {
      const brandBgColor = BrandIconService.getBrandBackgroundColor(matchedBrand, colorScheme ?? 'dark');
      if (brandBgColor) {
        return brandBgColor;
      }
    }

    // 如果没有品牌背景色，使用默认颜色
    switch (serviceName.toLowerCase()) {
      case 'google':
        return colorScheme === 'dark' ? '#2A1F1A' : '#FEF7F0';
      case 'microsoft':
        return colorScheme === 'dark' ? '#1A2329' : '#F0F8FF';
      case 'github':
        return colorScheme === 'dark' ? '#21262D' : '#F6F8FA';
      case 'discord':
        return colorScheme === 'dark' ? '#1E1F2E' : '#F0F2FF';
      case 'paypal':
        return colorScheme === 'dark' ? '#1A1F29' : '#F0F4FF';
      case 'steam':
        return colorScheme === 'dark' ? '#1E2328' : '#F0F2F5';
      default:
        return colors.primary + '20'; // 20% opacity
    }
  };

  const getAccountTypeLabel = () => {
    if (currentAccount.isTemporary) {
      return t('account.typeTemporary');
    }
    switch (currentAccount.type) {
      case 'TOTP':
        return 'TOTP';
      case 'HOTP':
        return 'HOTP';
      case 'mOTP':
        return 'mOTP';
      case 'Steam':
        return 'Steam';
      case 'EMAIL_OTP':
        return t('account.typeEmail');
      default:
        return 'OTP';
    }
  };

  const getAccountTypeColor = () => {
    if (currentAccount.isTemporary) {
      return isExpired() ? colors.error : colors.warning;
    }
    return colors.primary;
  };

  const getProgressPercentage = () => {
    if (!generatedCode) return 0;
    return (generatedCode.timeRemaining / generatedCode.period) * 100;
  };

  const getProgressColor = () => {
    if (isExpired()) return colors.error;
    const percentage = getProgressPercentage();
    if (percentage > 50) return colors.primary;
    if (percentage > 20) return colors.warning;
    return colors.error;
  };

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  // SVG Circle progress
  const radius = 20;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - getProgressPercentage() / 100);

  // Card content JSX
  const cardContent = (
    <Animated.View style={[animatedStyle]}>
      {/* 发光层 */}
      <Animated.View style={[glowStyle]} />
      <View style={[
        styles.container, 
        { backgroundColor: colors.cardBackground }
      ]}>
        <View style={styles.header}>
          <View style={styles.serviceInfo}>
            <View style={[styles.iconContainer, { backgroundColor: getServiceIconBackground(currentAccount.name) }]}>
              {getServiceIcon(currentAccount.name)}
            </View>
            <View style={styles.textInfo}>
              <Text style={[styles.serviceName, { color: colors.text }]}>
                {currentAccount.name}
              </Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>
                {currentAccount.email}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.typeLabel, { backgroundColor: getAccountTypeColor() + '20' }]}>
              <Text style={[styles.typeLabelText, { color: getAccountTypeColor() }]}>
                {getAccountTypeLabel()}
              </Text>
              {currentAccount.isTemporary && (
                <Clock size={12} color={getAccountTypeColor()} style={styles.typeIcon} />
              )}
            </View>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.codeSection}>
          <TouchableOpacity 
            onPress={handleCopyCode} 
            style={styles.codeContainer}
            disabled={isExpired()}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.code, 
              { 
                color: isExpired() ? colors.error : colors.codeText,
                opacity: isExpired() ? 0.6 : 1
              }
            ]}>
              {generatedCode?.code || '--- ---'}
            </Text>
            {!isExpired() && <Copy size={20} color={colors.textSecondary} />}
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <View style={styles.circularTimer}>
              <Svg width={50} height={50} style={styles.svgContainer}>
                {/* Background circle */}
                <Circle
                  cx={25}
                  cy={25}
                  r={radius}
                  stroke={colors.border}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                  cx={25}
                  cy={25}
                  r={radius}
                  stroke={getProgressColor()}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 25 25)`}
                />
              </Svg>
              <Text style={[styles.timer, { color: getProgressColor() }]}>
                {isExpired() ? '0s' : `${generatedCode?.timeRemaining || 0}s`}
              </Text>
            </View>
          </View>
        </View>

        {/* Full width progress bar */}
        <View style={[styles.fullProgressBar, { backgroundColor: colors.border }]}>
          <Animated.View 
            style={[
              styles.fullProgressFill, 
              { 
                backgroundColor: getProgressColor(),
              },
              animatedProgressStyle
            ]} 
          />
        </View>

        {/* Swipe hint for temporary accounts */}
        {(currentAccount.isTemporary || isExpired()) && (
          <View style={styles.swipeHint}>
            <Trash2 size={12} color={colors.textSecondary} />
            <Text style={[styles.swipeHintText, { color: colors.textSecondary }]}>
              {t('account.swipeToDelete')}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <>
      {/* For temporary accounts: use GestureDetector for swipe-to-delete */}
      {(currentAccount.isTemporary || isExpired()) ? (
        <GestureDetector gesture={panGesture}>
          {cardContent}
        </GestureDetector>
      ) : (
        /* For regular accounts: use TouchableOpacity for drag */
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={handleLongPress}
          delayLongPress={200}
        >
          {cardContent}
        </TouchableOpacity>
      )}

      {/* Context Menu */}
      <ContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        onEditName={handleEditName}
        onShowQRCode={handleShowQRCode}
        onViewEmail={handleViewEmail}
        position={menuPosition}
        account={currentAccount}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeIcon: {
    marginLeft: 4,
  },
  menuButton: {
    padding: 8,
  },
  codeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginRight: 12,
    letterSpacing: 2,
  },
  timerContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  circularTimer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
  },
  timer: {
    fontSize: 12,
    fontWeight: '600',
    position: 'absolute',
  },
  swipeHint: {
    position: 'absolute',
    top: 8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  swipeHintText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 2,
  },
  fullProgressBar: {
    height: 4,
    backgroundColor: 'transparent',
    marginTop: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  fullProgressFill: {
    height: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
}); 