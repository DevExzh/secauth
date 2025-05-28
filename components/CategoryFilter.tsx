import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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

const categories: { key: AccountCategory; label: string; icon: React.ReactNode }[] = [
  { 
    key: 'All', 
    label: '全部', 
    icon: <Grid3X3 size={16} />
  },
  { 
    key: 'Social', 
    label: '社交', 
    icon: <Users size={16} />
  },
  { 
    key: 'Finance', 
    label: '金融', 
    icon: <CreditCard size={16} />
  },
  { 
    key: 'Gaming', 
    label: '游戏', 
    icon: <Gamepad2 size={16} />
  },
  { 
    key: 'Work', 
    label: '工作', 
    icon: <Briefcase size={16} />
  },
  { 
    key: 'Other', 
    label: '其他', 
    icon: <MoreHorizontal size={16} />
  },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
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
                backgroundColor: isSelected ? colors.primary : 'transparent',
                borderColor: isSelected ? colors.primary : colors.border,
                marginLeft: isFirst ? 16 : 0,
                marginRight: isLast ? 16 : 12,
              },
            ]}
            onPress={() => onCategoryChange(category.key)}
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
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    paddingVertical: 8,
  },
  container: {
    alignItems: 'center',
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
  },
  iconContainer: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 