import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Colors } from '@/constants/Colors';
import { SettingItem as SettingItemType } from '@/constants/ProfileSettings';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingItemProps {
  item: SettingItemType;
  colors: typeof Colors.light;
}

export const SettingItem: React.FC<SettingItemProps> = ({ item, colors }) => {
  if (item.type === 'language') {
    return <LanguageSelector key={item.title} />;
  }

  return (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      disabled={item.type === 'switch' && !item.onPress}
      onPress={item.onPress}
    >
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.settingAction}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingAction: {
    marginLeft: 12,
  },
}); 