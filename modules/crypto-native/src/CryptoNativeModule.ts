import { NativeModule, requireNativeModule } from 'expo';

import {
  DecryptionOptions,
  DerivedKey,
  EncryptionOptions,
  EncryptionResult,
  HashAlgorithm,
  HmacOptions,
  KeyDerivationOptions,
  RandomBytesOptions
} from './CryptoNative.types';

declare class CryptoNativeModule extends NativeModule {

  // Core Cryptographic Functions
  
  /**
   * Encrypts data using specified algorithm and options
   * @param data - Data to encrypt (Base64 encoded)
   * @param key - Encryption key (Base64 encoded)
   * @param options - Encryption options
   * @returns Promise resolving to encryption result
   */
  encrypt(data: string, key: string, options: EncryptionOptions): Promise<EncryptionResult>;

  /**
   * Decrypts data using specified algorithm and options
   * @param ciphertext - Encrypted data (Base64 encoded)
   * @param key - Decryption key (Base64 encoded)
   * @param options - Decryption options
   * @returns Promise resolving to decrypted data (Base64 encoded)
   */
  decrypt(ciphertext: string, key: string, options: DecryptionOptions): Promise<string>;

  // Key Management

  /**
   * Generates a cryptographically secure random key
   * @param length - Key length in bytes
   * @returns Promise resolving to random key (Base64 encoded)
   */
  generateKey(length: number): Promise<string>;

  /**
   * Derives a key from password using specified KDF
   * @param password - Password string
   * @param options - Key derivation options
   * @returns Promise resolving to derived key and salt
   */
  deriveKey(password: string, options: KeyDerivationOptions): Promise<DerivedKey>;

  /**
   * Derives a key from password with existing salt
   * @param password - Password string
   * @param salt - Salt (Base64 encoded)
   * @param options - Key derivation options
   * @returns Promise resolving to derived key (Base64 encoded)
   */
  deriveKeyWithSalt(password: string, salt: string, options: KeyDerivationOptions): Promise<string>;

  // Hashing and HMAC

  /**
   * Computes hash of data
   * @param data - Data to hash (Base64 encoded)
   * @param algorithm - Hash algorithm
   * @returns Promise resolving to hash (Base64 encoded)
   */
  hash(data: string, algorithm: HashAlgorithm): Promise<string>;

  /**
   * Computes HMAC of data
   * @param data - Data to authenticate (Base64 encoded)
   * @param key - HMAC key (Base64 encoded)
   * @param options - HMAC options
   * @returns Promise resolving to HMAC (Base64 encoded)
   */
  hmac(data: string, key: string, options: HmacOptions): Promise<string>;

  // Random Number Generation

  /**
   * Generates cryptographically secure random bytes
   * @param options - Random bytes options
   * @returns Promise resolving to random bytes (Base64 encoded)
   */
  randomBytes(options: RandomBytesOptions): Promise<string>;

  /**
   * Generates cryptographically secure random integer
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Promise resolving to random integer
   */
  randomInt(min: number, max: number): Promise<number>;

  // Utility Functions

  /**
   * Converts string to Base64
   * @param data - String to encode
   * @returns Promise resolving to Base64 encoded string
   */
  encodeBase64(data: string): Promise<string>;

  /**
   * Converts Base64 to string
   * @param data - Base64 encoded string
   * @returns Promise resolving to decoded string
   */
  decodeBase64(data: string): Promise<string>;

  /**
   * Converts hex string to Base64
   * @param hex - Hex string
   * @returns Promise resolving to Base64 encoded string
   */
  hexToBase64(hex: string): Promise<string>;

  /**
   * Converts Base64 to hex string
   * @param base64 - Base64 encoded string
   * @returns Promise resolving to hex string
   */
  base64ToHex(base64: string): Promise<string>;

  // Security Utilities

  /**
   * Securely compares two strings in constant time
   * @param a - First string
   * @param b - Second string
   * @returns Promise resolving to boolean indicating equality
   */
  secureCompare(a: string, b: string): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CryptoNativeModule>('CryptoNative');
