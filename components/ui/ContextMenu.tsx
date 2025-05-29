import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { Edit, QrCode } from 'lucide-react-native';
import React from 'react';
import {
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
  onEditName: () => void;
  onShowQRCode: () => void;
  position: { x: number; y: number };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  onEditName,
  onShowQRCode,
  position,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const handleEditName = () => {
    onEditName();
    onClose();
  };

  const handleShowQRCode = () => {
    onShowQRCode();
    onClose();
  };

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
                  top: position.y,
                  right: 16, // Always align to right edge with some margin
                },
              ]}
            >
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
  },
}); 