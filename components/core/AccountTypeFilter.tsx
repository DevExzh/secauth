import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { ChevronDown, Clock, Filter, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type AccountTypeFilterValue = 'otp' | 'temporary' | 'all';

interface AccountTypeFilterProps {
  selectedType: AccountTypeFilterValue;
  onTypeChange: (type: AccountTypeFilterValue) => void;
}

export function AccountTypeFilter({ selectedType, onTypeChange }: AccountTypeFilterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  const filterTypes: { key: AccountTypeFilterValue; labelKey: string; icon: React.ReactNode }[] = [
    { 
      key: 'all', 
      labelKey: 'filter.all',
      icon: <Filter size={16} color={colors.text} />
    },
    { 
      key: 'otp', 
      labelKey: 'filter.otp',
      icon: <Shield size={16} color={colors.primary} />
    },
    { 
      key: 'temporary', 
      labelKey: 'filter.temporary',
      icon: <Clock size={16} color={colors.warning} />
    },
  ];

  const handleTypeSelect = (type: AccountTypeFilterValue) => {
    onTypeChange(type);
    setShowDropdown(false);
  };

  const getFilterIcon = () => {
    switch (selectedType) {
      case 'otp':
        return <Shield size={20} color={colors.primary} />;
      case 'temporary':
        return <Clock size={20} color={colors.warning} />;
      default:
        return <Filter size={20} color={colors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: selectedType !== 'all' ? colors.primary + '15' : colors.surface,
            borderColor: selectedType !== 'all' ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setShowDropdown(true)}
        activeOpacity={0.7}
      >
        {getFilterIcon()}
        <ChevronDown size={16} color={colors.textSecondary} style={styles.chevron} />
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.cardBackground }]}>
            {filterTypes.map(({ key, labelKey, icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.dropdownItem,
                  {
                    backgroundColor: selectedType === key ? colors.primary + '15' : 'transparent',
                  },
                ]}
                onPress={() => handleTypeSelect(key)}
              >
                {icon}
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: selectedType === key ? colors.primary : colors.text,
                      fontWeight: selectedType === key ? '600' : '400',
                    },
                  ]}
                >
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
  },
  chevron: {
    marginLeft: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    minWidth: 150,
    borderRadius: 12,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 