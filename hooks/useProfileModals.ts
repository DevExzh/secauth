import { useCallback, useState } from 'react';

export const useProfileModals = () => {
  // Modal visibility states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAutoLockModal, setShowAutoLockModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showEmailIntegration, setShowEmailIntegration] = useState(false);
  const [showEmailParsing, setShowEmailParsing] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showConnectedAccounts, setShowConnectedAccounts] = useState(false);
  const [showSyncFrequency, setShowSyncFrequency] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showImportData, setShowImportData] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showAboutApp, setShowAboutApp] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Modal handlers
  const openPinModal = useCallback(() => setShowPinModal(true), []);
  const closePinModal = useCallback(() => setShowPinModal(false), []);
  
  const openAutoLockModal = useCallback(() => setShowAutoLockModal(true), []);
  const closeAutoLockModal = useCallback(() => setShowAutoLockModal(false), []);
  
  const openThemeModal = useCallback(() => setShowThemeModal(true), []);
  const closeThemeModal = useCallback(() => setShowThemeModal(false), []);
  
  const openEmailSettings = useCallback(() => setShowEmailSettings(true), []);
  const closeEmailSettings = useCallback(() => setShowEmailSettings(false), []);
  
  const openConnectedAccounts = useCallback(() => setShowConnectedAccounts(true), []);
  const closeConnectedAccounts = useCallback(() => setShowConnectedAccounts(false), []);
  
  const openEmailIntegration = useCallback(() => setShowEmailIntegration(true), []);
  const closeEmailIntegration = useCallback(() => setShowEmailIntegration(false), []);
  
  const openEmailParsing = useCallback(() => setShowEmailParsing(true), []);
  const closeEmailParsing = useCallback(() => setShowEmailParsing(false), []);
  
  const openSyncFrequency = useCallback(() => setShowSyncFrequency(true), []);
  const closeSyncFrequency = useCallback(() => setShowSyncFrequency(false), []);
  
  const openCloudSync = useCallback(() => setShowCloudSync(true), []);
  const closeCloudSync = useCallback(() => setShowCloudSync(false), []);

  const openImportData = useCallback(() => setShowImportData(true), []);
  const closeImportData = useCallback(() => setShowImportData(false), []);

  const openExportData = useCallback(() => setShowExportData(true), []);
  const closeExportData = useCallback(() => setShowExportData(false), []);

  const openHelpCenter = useCallback(() => setShowHelpCenter(true), []);
  const closeHelpCenter = useCallback(() => setShowHelpCenter(false), []);

  const openAboutApp = useCallback(() => setShowAboutApp(true), []);
  const closeAboutApp = useCallback(() => setShowAboutApp(false), []);
  
  const startScanning = useCallback(() => setIsScanning(true), []);
  const stopScanning = useCallback(() => setIsScanning(false), []);

  // Navigation helpers
  const navigateToConnectedAccounts = useCallback(() => {
    closeEmailSettings();
    openConnectedAccounts();
  }, [closeEmailSettings, openConnectedAccounts]);

  const navigateToEmailIntegration = useCallback(() => {
    closeEmailSettings();
    closeConnectedAccounts();
    openEmailIntegration();
  }, [closeEmailSettings, closeConnectedAccounts, openEmailIntegration]);

  const navigateToSyncFrequency = useCallback(() => {
    closeEmailSettings();
    openSyncFrequency();
  }, [closeEmailSettings, openSyncFrequency]);

  const handleGrantAccess = useCallback(() => {
    closeEmailIntegration();
    startScanning();
    
    // Simulate scanning process
    setTimeout(() => {
      stopScanning();
      openEmailParsing();
    }, 2000);
  }, [closeEmailIntegration, startScanning, stopScanning, openEmailParsing]);

  return {
    // Modal states
    showPinModal,
    showAutoLockModal,
    showThemeModal,
    showEmailIntegration,
    showEmailParsing,
    showEmailSettings,
    showConnectedAccounts,
    showSyncFrequency,
    showCloudSync,
    showImportData,
    showExportData,
    showHelpCenter,
    showAboutApp,
    isScanning,
    
    // Individual setters
    setShowPinModal,
    setShowAutoLockModal,
    setShowThemeModal,
    setShowEmailSettings,
    setShowConnectedAccounts,
    setShowSyncFrequency,
    setShowCloudSync,
    setShowImportData,
    setShowExportData,
    setShowHelpCenter,
    setShowAboutApp,
    
    // Modal handlers
    openPinModal,
    closePinModal,
    openAutoLockModal,
    closeAutoLockModal,
    openThemeModal,
    closeThemeModal,
    openEmailSettings,
    closeEmailSettings,
    openConnectedAccounts,
    closeConnectedAccounts,
    openEmailIntegration,
    closeEmailIntegration,
    openEmailParsing,
    closeEmailParsing,
    openSyncFrequency,
    closeSyncFrequency,
    openCloudSync,
    closeCloudSync,
    openImportData,
    closeImportData,
    openExportData,
    closeExportData,
    openHelpCenter,
    closeHelpCenter,
    openAboutApp,
    closeAboutApp,
    startScanning,
    stopScanning,
    
    // Navigation helpers
    navigateToConnectedAccounts,
    navigateToEmailIntegration,
    navigateToSyncFrequency,
    handleGrantAccess,
  };
}; 