import { CloudSyncSettings } from '@/components/settings/CloudSyncSettings';
import React from 'react';

interface CloudSyncStaticScreenProps {
  onClose?: () => void; // Optional close handler
}

export default function CloudSyncStaticScreen({ onClose }: CloudSyncStaticScreenProps) {
  return (
    <CloudSyncSettings onBack={onClose || (() => {})} />
  );
} 