import React from 'react';
import { CloudSyncSettings } from '../CloudSyncSettings';

interface CloudSyncStaticScreenProps {
  onClose?: () => void; // Optional close handler
}

export default function CloudSyncStaticScreen({ onClose }: CloudSyncStaticScreenProps) {
  return (
    <CloudSyncSettings onBack={onClose || (() => {})} />
  );
} 