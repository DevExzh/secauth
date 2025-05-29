import { Colors } from '@/constants/Colors';
import { Settings, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  colors: typeof Colors.light;
  userName?: string;
  userEmail?: string;
  onEditPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  colors,
  userName = 'User',
  userEmail = 'user@example.com',
  onEditPress,
}) => {
  return (
    <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
      <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
        <User size={32} color={colors.background} />
      </View>
      <View style={styles.profileInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {userName}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {userEmail}
        </Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Settings size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
}); 