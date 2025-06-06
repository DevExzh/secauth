import { useCallback, useState } from 'react';

export const useProfileModals = () => {
  // 只保留真正需要的loading状态，因为这些不适合用native screen实现
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Loading handlers
  const startScanning = useCallback(() => setIsScanning(true), []);
  const stopScanning = useCallback(() => setIsScanning(false), []);
  
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return {
    // Loading states - 只保留真正需要overlay的状态
    isScanning,
    isLoading,
    
    // Loading handlers
    startScanning,
    stopScanning,
    startLoading,
    stopLoading,
  };
}; 