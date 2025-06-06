import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeArea } from '@/hooks/useSafeArea';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  showBorder?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightComponent,
  style,
  showBorder = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const safeArea = useSafeArea();

  const headerStyle: ViewStyle = {
    ...styles.header,
    paddingTop: Platform.OS === 'android' ? safeArea.statusBarHeight + 12 : 12,
    backgroundColor: colors.background,
    borderBottomColor: showBorder ? colors.border : 'transparent',
    ...style,
  };

  return (
    <View style={headerStyle}>
      <View style={styles.headerContent}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        {title && (
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {title}
          </Text>
        )}
        
        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
}); 