import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { AccountCategory } from '@/types/auth';
import {
    Briefcase,
    CreditCard,
    Gamepad2,
    Grid3X3,
    MoreHorizontal,
    Users
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryFilterProps {
  selectedCategory: AccountCategory;
  onCategoryChange: (category: AccountCategory) => void;
}

const getCategoryConfig = (t: any): { key: AccountCategory; labelKey: string; icon: React.ReactNode }[] => [
  { 
    key: 'All', 
    labelKey: 'categories.all',
    icon: <Grid3X3 size={16} />
  },
  { 
    key: 'Social', 
    labelKey: 'categories.social',
    icon: <Users size={16} />
  },
  { 
    key: 'Finance', 
    labelKey: 'categories.finance',
    icon: <CreditCard size={16} />
  },
  { 
    key: 'Gaming', 
    labelKey: 'categories.gaming',
    icon: <Gamepad2 size={16} />
  },
  { 
    key: 'Work', 
    labelKey: 'categories.work',
    icon: <Briefcase size={16} />
  },
  { 
    key: 'Other', 
    labelKey: 'categories.other',
    icon: <MoreHorizontal size={16} />
  },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const categories = getCategoryConfig(t);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      >
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category.key;
          const isFirst = index === 0;
          const isLast = index === categories.length - 1;
          
          return (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  marginLeft: isFirst ? 16 : 0,
                  marginRight: isLast ? 16 : 12,
                },
              ]}
              onPress={() => onCategoryChange(category.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {React.cloneElement(category.icon as React.ReactElement<any>, {
                  color: isSelected ? colors.background : colors.textSecondary,
                })}
              </View>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected ? colors.background : colors.text,
                  },
                ]}
              >
                {t(category.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  scrollView: {
    flexGrow: 0,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    height: 36,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 