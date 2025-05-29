import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface LoadingModalProps {
  colors: typeof Colors.light;
  title: string;
  subtitle: string;
  visible: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  colors,
  title,
  subtitle,
  visible,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();
    }
  }, [visible, spinValue]);

  if (!visible) return null;

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.modal, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
        <Animated.View 
          style={[
            styles.loadingIndicator, 
            { 
              borderColor: colors.primary,
              transform: [{ rotate: spinAnimation }],
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
}); 