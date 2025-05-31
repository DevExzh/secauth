import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type CryptoNativeModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type CryptoNativeViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

// Cryptographic Types
export enum CipherAlgorithm {
  AES_128_CBC = 'AES_128_CBC',
  AES_192_CBC = 'AES_192_CBC',
  AES_256_CBC = 'AES_256_CBC',
  AES_128_GCM = 'AES_128_GCM',
  AES_192_GCM = 'AES_192_GCM',
  AES_256_GCM = 'AES_256_GCM',
  AES_128_CTR = 'AES_128_CTR',
  AES_192_CTR = 'AES_192_CTR',
  AES_256_CTR = 'AES_256_CTR',
  CHACHA20 = 'CHACHA20',
  CHACHA20_POLY1305 = 'CHACHA20_POLY1305',
}

export enum PaddingMode {
  PKCS7 = 'PKCS7',
  PKCS5 = 'PKCS5',
  ISO10126 = 'ISO10126',
  ANSIX923 = 'ANSIX923',
  ZERO = 'ZERO',
  NONE = 'NONE',
}

export enum HashAlgorithm {
  SHA1 = 'SHA1',
  SHA256 = 'SHA256',
  SHA384 = 'SHA384',
  SHA512 = 'SHA512',
  MD5 = 'MD5',
}

export enum KeyDerivationFunction {
  PBKDF2 = 'PBKDF2',
  SCRYPT = 'SCRYPT',
  ARGON2 = 'ARGON2',
}

export interface EncryptionOptions {
  algorithm: CipherAlgorithm;
  padding?: PaddingMode;
  iv?: string; // Base64 encoded
  aad?: string; // Additional authenticated data for GCM/AEAD modes (Base64 encoded)
}

export interface DecryptionOptions {
  algorithm: CipherAlgorithm;
  padding?: PaddingMode;
  iv: string; // Base64 encoded
  aad?: string; // Additional authenticated data for GCM/AEAD modes (Base64 encoded)
  tag?: string; // Authentication tag for GCM/AEAD modes (Base64 encoded)
}

export interface EncryptionResult {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
  tag?: string; // Authentication tag for GCM/AEAD modes (Base64 encoded)
}

export interface KeyDerivationOptions {
  kdf: KeyDerivationFunction;
  iterations?: number;
  saltLength?: number;
  keyLength?: number;
  memory?: number; // For Argon2
  parallelism?: number; // For Argon2
}

export interface DerivedKey {
  key: string; // Base64 encoded
  salt: string; // Base64 encoded
}

export interface HmacOptions {
  algorithm: HashAlgorithm;
}

export interface SignatureOptions {
  algorithm: HashAlgorithm;
}

export interface RandomBytesOptions {
  length: number;
}
