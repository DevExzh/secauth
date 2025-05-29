import { Colors } from '@/constants/Colors';
import { SettingsGroup as SettingsGroupType } from '@/constants/ProfileSettings';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SettingItem } from './SettingItem';

interface SettingsGroupProps {
  group: SettingsGroupType;
  colors: typeof Colors.light;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({ group, colors }) => {
  return (
    <View style={styles.settingsGroup}>
      <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
        {group.title}
      </Text>
      <View style={[styles.groupContainer, { backgroundColor: colors.surface }]}>
        {group.items.map((item, itemIndex) => (
          <View key={item.title}>
            <SettingItem item={item} colors={colors} />
            {itemIndex < group.items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  groupContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    marginLeft: 48,
  },
}); 