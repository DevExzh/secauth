import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BrandIconService } from '@/services/brandIconService';
import { TOTPService } from '@/services/totpService';
import type { Account, GeneratedCode } from '@/types/auth';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  Copy,
  CreditCard,
  Gamepad2,
  Github,
  Mail,
  MessageCircle,
  MoreVertical,
  Shield
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface AccountCardProps {
  account: Account;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const progressValue = useSharedValue(0);

  const updateCode = useCallback(() => {
    try {
      const code = TOTPService.generateCode(account);
      setGeneratedCode(code);
      progressValue.value = withTiming(code.timeRemaining / code.period, { duration: 100 });
    } catch (error) {
      console.error('Error generating code:', error);
      // Set a placeholder code
      setGeneratedCode({
        code: '--- ---',
        timeRemaining: 30,
        period: 30,
      });
      progressValue.value = withTiming(1, { duration: 100 });
    }
  }, [account, progressValue]);

  useEffect(() => {
    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [updateCode]);

  const handleCopyCode = useCallback(async () => {
    if (generatedCode) {
      await Clipboard.setStringAsync(generatedCode.code.replace(' ', ''));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('已复制', '验证码已复制到剪贴板');
    }
  }, [generatedCode]);

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

  const getProgressPercentage = () => {
    if (!generatedCode) return 0;
    return (generatedCode.timeRemaining / generatedCode.period) * 100;
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage > 50) return colors.primary;
    if (percentage > 20) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
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

  return (
    <View style={[styles.container, { backgroundColor: (colors as any).cardBackground || colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <View style={[styles.iconContainer, { backgroundColor: getServiceIconBackground(account.name) }]}>
            {getServiceIcon(account.name)}
          </View>
          <View style={styles.textInfo}>
            <Text style={[styles.serviceName, { color: colors.text }]}>
              {account.name}
            </Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {account.email}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MoreVertical size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.codeSection}>
        <TouchableOpacity onPress={handleCopyCode} style={styles.codeContainer}>
          <Text style={[styles.code, { color: (colors as any).codeText || colors.primary }]}>
            {generatedCode?.code || '--- ---'}
          </Text>
          <Copy size={20} color={colors.textSecondary} />
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
              {generatedCode?.timeRemaining || 0}s
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  menuButton: {
    padding: 8,
  },
  codeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  fullProgressBar: {
    height: 4,
    backgroundColor: 'transparent',
    marginTop: 16,
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