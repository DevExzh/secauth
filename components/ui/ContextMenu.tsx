import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { Account } from '@/types/auth';
import { Edit, Mail, QrCode } from 'lucide-react-native';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onEditName?: () => void;
  onShowQRCode?: () => void;
  onViewEmail?: () => void;
  position: { x: number; y: number };
  account?: Account;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  onEditName,
  onShowQRCode,
  onViewEmail,
  position,
  account,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const isEmailAccount = account?.type === 'EMAIL_OTP' || account?.isTemporary;

  const handleEditName = () => {
    if (onEditName) {
      onEditName();
    }
    onClose();
  };

  const handleShowQRCode = () => {
    if (onShowQRCode) {
      onShowQRCode();
    }
    onClose();
  };

  const handleViewEmail = () => {
    if (onViewEmail) {
      onViewEmail();
    }
    onClose();
  };

  // Calculate smart positioning
  const getMenuPosition = () => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const menuWidth = 200; // Estimated menu width
    const menuHeight = isEmailAccount ? 60 : 120; // Estimated menu height
    const margin = 16;
    
    let left = position.x;
    let top = position.y;
    
    // Adjust horizontal position if menu would go off-screen
    if (left + menuWidth > screenWidth - margin) {
      left = screenWidth - menuWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }
    
    // Adjust vertical position if menu would go off-screen
    if (top + menuHeight > screenHeight - margin) {
      top = position.y - menuHeight - 10; // Show above the trigger point
    }
    if (top < margin) {
      top = margin;
    }
    
    return { left, top };
  };

  const menuPosition = getMenuPosition();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.menuContainer,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  top: menuPosition.top,
                  left: menuPosition.left,
                },
              ]}
            >
              {isEmailAccount ? (
                // Email account menu - only show "View Original Email"
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleViewEmail}
                >
                  <Mail size={20} color={colors.text} />
                  <Text style={[styles.menuText, { color: colors.text }]}>
                    {t('accountMenu.viewOriginalEmail')}
                  </Text>
                </TouchableOpacity>
              ) : (
                // Regular account menu
                <>
                  <TouchableOpacity
                    style={[styles.menuItem, { borderBottomColor: colors.border }]}
                    onPress={handleEditName}
                  >
                    <Edit size={20} color={colors.text} />
                    <Text style={[styles.menuText, { color: colors.text }]}>
                      {t('accountMenu.editName')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleShowQRCode}
                  >
                    <QrCode size={20} color={colors.text} />
                    <Text style={[styles.menuText, { color: colors.text }]}>
                      {t('accountMenu.showQRCode')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 160,
    maxWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 12,
    flex: 1,
  },
}); 