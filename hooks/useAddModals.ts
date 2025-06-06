import type { AccountCategory, AuthType } from '@/types/auth';
import { useCallback, useState } from 'react';

export interface AddFormData {
  name: string;
  email: string;
  secret: string;
  type: AuthType;
  category: AccountCategory;
  // Type-specific fields
  pin: string; // For mOTP
  counter: string; // For HOTP
  // Advanced options
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: string;
  period: string; // For TOTP
}

export const useAddModals = () => {
  // 只保留核心的overlay modal状态
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // 表单数据状态
  const [formData, setFormData] = useState<AddFormData>({
    name: '',
    email: '',
    secret: '',
    type: 'TOTP' as AuthType,
    category: 'Other' as AccountCategory,
    pin: '',
    counter: '0',
    algorithm: 'SHA1' as 'SHA1' | 'SHA256' | 'SHA512',
    digits: '6',
    period: '30',
  });

  // QR Scanner handlers - now using native screen
  const openQRScanner = useCallback(() => {
    // Import router dynamically to avoid circular dependencies
    import('expo-router').then(({ router }) => {
      router.push('/modals/account/qr-scanner' as any);
    });
  }, []);
  const closeQRScanner = useCallback(() => setShowQRScanner(false), []);
  
  // Manual Form handlers
  const openManualForm = useCallback(() => setShowManualForm(true), []);
  const closeManualForm = useCallback(() => setShowManualForm(false), []);
  
  // Form data handlers
  const updateFormData = useCallback((updates: Partial<AddFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);
  
  const resetFormData = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      secret: '',
      type: 'TOTP',
      category: 'Other',
      pin: '',
      counter: '0',
      algorithm: 'SHA1',
      digits: '6',
      period: '30',
    });
  }, []);

  return {
    // Modal states - 只有2个核心状态
    showQRScanner,
    showManualForm,
    
    // Form data
    formData,
    
    // Modal handlers
    openQRScanner,
    closeQRScanner,
    openManualForm,
    closeManualForm,
    
    // Form handlers
    updateFormData,
    resetFormData,
    setFormData,
  };
}; 