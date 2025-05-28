export type AuthType = 'TOTP' | 'HOTP' | 'Steam';

export type AccountCategory = 'All' | 'Social' | 'Finance' | 'Gaming' | 'Work' | 'Other';

export interface Account {
  id: string;
  name: string;
  email: string;
  secret: string;
  type: AuthType;
  category: AccountCategory;
  issuer?: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number; // For TOTP
  counter?: number; // For HOTP
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedCode {
  code: string;
  timeRemaining: number;
  period: number;
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'other';
  isConnected: boolean;
  lastSync?: Date;
}

export interface EmailVerification {
  id: string;
  from: string;
  subject: string;
  code?: string;
  expiresAt?: Date;
  isConfirmation: boolean;
  actionUrl?: string;
  receivedAt: Date;
  isCompleted: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  autoLock: boolean;
  autoLockTimeout: number; // in minutes
  biometricAuth: boolean;
  showCodes: boolean;
  defaultCategory: AccountCategory;
  syncEnabled: boolean;
  syncProvider?: 'webdav' | 'icloud' | 'gdrive' | 'dropbox';
  syncUrl?: string;
  notifications: {
    codeExpiry: boolean;
    emailVerifications: boolean;
    syncStatus: boolean;
  };
} 