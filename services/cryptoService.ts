import CryptoNative from '@/modules/crypto-native';
import type {
    DecryptionOptions,
    DerivedKey,
    EncryptionOptions,
    EncryptionResult,
    HmacOptions,
    KeyDerivationOptions,
    RandomBytesOptions
} from '@/modules/crypto-native/src/CryptoNative.types';
import {
    CipherAlgorithm,
    HashAlgorithm,
    KeyDerivationFunction,
    PaddingMode,
} from '@/modules/crypto-native/src/CryptoNative.types';

export interface CryptoConfig {
  defaultAlgorithm?: CipherAlgorithm;
  defaultPadding?: PaddingMode;
  defaultHashAlgorithm?: HashAlgorithm;
  defaultKeyLength?: number;
  defaultIterations?: number;
}

export interface SecureStorageOptions {
  password: string;
  data: string;
  algorithm?: CipherAlgorithm;
  kdf?: KeyDerivationFunction;
  iterations?: number;
}

export interface SecureStorageResult {
  encryptedData: string;
  salt: string;
  iv: string;
  tag?: string;
  algorithm: CipherAlgorithm;
  kdf: KeyDerivationFunction;
  iterations: number;
}

export class CryptoService {
  private static readonly DEFAULT_CONFIG: Required<CryptoConfig> = {
    defaultAlgorithm: CipherAlgorithm.AES_256_GCM,
    defaultPadding: PaddingMode.PKCS7,
    defaultHashAlgorithm: HashAlgorithm.SHA256,
    defaultKeyLength: 32, // 256 bits
    defaultIterations: 100000,
  };

  private static config: Required<CryptoConfig> = { ...this.DEFAULT_CONFIG };

  /**
   * Configure default crypto settings
   */
  static configure(config: Partial<CryptoConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  static getConfig(): Required<CryptoConfig> {
    return { ...this.config };
  }

  // Encryption and Decryption

  /**
   * Encrypt data with password using secure defaults
   */
  static async encryptWithPassword(
    data: string,
    password: string,
    options?: Partial<SecureStorageOptions>
  ): Promise<SecureStorageResult> {
    try {
      const algorithm = options?.algorithm || this.config.defaultAlgorithm;
      const kdf = options?.kdf || KeyDerivationFunction.PBKDF2;
      const iterations = options?.iterations || this.config.defaultIterations;

      // Encode data to Base64
      const encodedData = await CryptoNative.encodeBase64(data);

      // Derive key from password
      const derivedKey = await CryptoNative.deriveKey(password, {
        kdf,
        iterations,
        keyLength: this.getKeyLengthForAlgorithm(algorithm),
        saltLength: 16,
      });

      // Encrypt data
      const encryptionResult = await CryptoNative.encrypt(encodedData, derivedKey.key, {
        algorithm,
        padding: this.config.defaultPadding,
      });

      return {
        encryptedData: encryptionResult.ciphertext,
        salt: derivedKey.salt,
        iv: encryptionResult.iv,
        tag: encryptionResult.tag,
        algorithm,
        kdf,
        iterations,
      };
    } catch (error) {
      console.error('Error encrypting with password:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data with password
   */
  static async decryptWithPassword(
    encryptedData: SecureStorageResult,
    password: string
  ): Promise<string> {
    try {
      // Derive key from password using stored parameters
      const derivedKey = await CryptoNative.deriveKeyWithSalt(
        password,
        encryptedData.salt,
        {
          kdf: encryptedData.kdf,
          iterations: encryptedData.iterations,
          keyLength: this.getKeyLengthForAlgorithm(encryptedData.algorithm),
        }
      );

      // Decrypt data
      const decryptedBase64 = await CryptoNative.decrypt(
        encryptedData.encryptedData,
        derivedKey,
        {
          algorithm: encryptedData.algorithm,
          padding: this.config.defaultPadding,
          iv: encryptedData.iv,
          tag: encryptedData.tag,
        }
      );

      // Decode from Base64
      return await CryptoNative.decodeBase64(decryptedBase64);
    } catch (error) {
      console.error('Error decrypting with password:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt data with a key
   */
  static async encrypt(
    data: string,
    key: string,
    options?: Partial<EncryptionOptions>
  ): Promise<EncryptionResult> {
    try {
      const encodedData = await CryptoNative.encodeBase64(data);
      
      const encryptionOptions: EncryptionOptions = {
        algorithm: options?.algorithm || this.config.defaultAlgorithm,
        padding: options?.padding || this.config.defaultPadding,
        iv: options?.iv,
        aad: options?.aad,
      };

      return await CryptoNative.encrypt(encodedData, key, encryptionOptions);
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data with a key
   */
  static async decrypt(
    ciphertext: string,
    key: string,
    options: DecryptionOptions
  ): Promise<string> {
    try {
      const decryptedBase64 = await CryptoNative.decrypt(ciphertext, key, options);
      return await CryptoNative.decodeBase64(decryptedBase64);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Key Management

  /**
   * Generate a secure random key
   */
  static async generateKey(length?: number): Promise<string> {
    try {
      const keyLength = length || this.config.defaultKeyLength;
      return await CryptoNative.generateKey(keyLength);
    } catch (error) {
      console.error('Error generating key:', error);
      throw new Error('Failed to generate key');
    }
  }

  /**
   * Derive key from password with secure defaults
   */
  static async deriveKey(
    password: string,
    options?: Partial<KeyDerivationOptions>
  ): Promise<DerivedKey> {
    try {
      const derivationOptions: KeyDerivationOptions = {
        kdf: options?.kdf || KeyDerivationFunction.PBKDF2,
        iterations: options?.iterations || this.config.defaultIterations,
        saltLength: options?.saltLength || 16,
        keyLength: options?.keyLength || this.config.defaultKeyLength,
        memory: options?.memory,
        parallelism: options?.parallelism,
      };

      return await CryptoNative.deriveKey(password, derivationOptions);
    } catch (error) {
      console.error('Error deriving key:', error);
      throw new Error('Failed to derive key');
    }
  }

  // Hashing and HMAC

  /**
   * Compute hash of data
   */
  static async hash(
    data: string,
    algorithm?: HashAlgorithm
  ): Promise<string> {
    try {
      const encodedData = await CryptoNative.encodeBase64(data);
      const hashAlgorithm = algorithm || this.config.defaultHashAlgorithm;
      return await CryptoNative.hash(encodedData, hashAlgorithm);
    } catch (error) {
      console.error('Error computing hash:', error);
      throw new Error('Failed to compute hash');
    }
  }

  /**
   * Compute HMAC of data
   */
  static async hmac(
    data: string,
    key: string,
    algorithm?: HashAlgorithm
  ): Promise<string> {
    try {
      const encodedData = await CryptoNative.encodeBase64(data);
      const hmacOptions: HmacOptions = {
        algorithm: algorithm || this.config.defaultHashAlgorithm,
      };
      return await CryptoNative.hmac(encodedData, key, hmacOptions);
    } catch (error) {
      console.error('Error computing HMAC:', error);
      throw new Error('Failed to compute HMAC');
    }
  }

  /**
   * Verify HMAC
   */
  static async verifyHmac(
    data: string,
    key: string,
    expectedHmac: string,
    algorithm?: HashAlgorithm
  ): Promise<boolean> {
    try {
      const computedHmac = await this.hmac(data, key, algorithm);
      return await CryptoNative.secureCompare(computedHmac, expectedHmac);
    } catch (error) {
      console.error('Error verifying HMAC:', error);
      return false;
    }
  }

  // Random Number Generation

  /**
   * Generate cryptographically secure random bytes
   */
  static async randomBytes(length: number): Promise<string> {
    try {
      const options: RandomBytesOptions = { length };
      return await CryptoNative.randomBytes(options);
    } catch (error) {
      console.error('Error generating random bytes:', error);
      throw new Error('Failed to generate random bytes');
    }
  }

  /**
   * Generate cryptographically secure random integer
   */
  static async randomInt(min: number, max: number): Promise<number> {
    try {
      if (min >= max) {
        throw new Error('min must be less than max');
      }
      return await CryptoNative.randomInt(min, max);
    } catch (error) {
      console.error('Error generating random integer:', error);
      throw new Error('Failed to generate random integer');
    }
  }

  /**
   * Generate random password
   */
  static async generatePassword(
    length: number = 16,
    includeSymbols: boolean = true
  ): Promise<string> {
    try {
      const charset = includeSymbols
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      let password = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = await this.randomInt(0, charset.length);
        password += charset[randomIndex];
      }
      return password;
    } catch (error) {
      console.error('Error generating password:', error);
      throw new Error('Failed to generate password');
    }
  }

  // Utility Functions

  /**
   * Encode string to Base64
   */
  static async encodeBase64(data: string): Promise<string> {
    try {
      return await CryptoNative.encodeBase64(data);
    } catch (error) {
      console.error('Error encoding Base64:', error);
      throw new Error('Failed to encode Base64');
    }
  }

  /**
   * Decode Base64 to string
   */
  static async decodeBase64(data: string): Promise<string> {
    try {
      return await CryptoNative.decodeBase64(data);
    } catch (error) {
      console.error('Error decoding Base64:', error);
      throw new Error('Failed to decode Base64');
    }
  }

  /**
   * Convert hex to Base64
   */
  static async hexToBase64(hex: string): Promise<string> {
    try {
      return await CryptoNative.hexToBase64(hex);
    } catch (error) {
      console.error('Error converting hex to Base64:', error);
      throw new Error('Failed to convert hex to Base64');
    }
  }

  /**
   * Convert Base64 to hex
   */
  static async base64ToHex(base64: string): Promise<string> {
    try {
      return await CryptoNative.base64ToHex(base64);
    } catch (error) {
      console.error('Error converting Base64 to hex:', error);
      throw new Error('Failed to convert Base64 to hex');
    }
  }

  // Security Utilities

  /**
   * Securely compare two strings in constant time
   */
  static async secureCompare(a: string, b: string): Promise<boolean> {
    try {
      return await CryptoNative.secureCompare(a, b);
    } catch (error) {
      console.error('Error in secure comparison:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    if (password.length >= 12) {
      score += 1;
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain uppercase letters');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain numbers');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain special characters');
    }

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  }

  // Helper Methods

  /**
   * Get key length for algorithm
   */
  private static getKeyLengthForAlgorithm(algorithm: CipherAlgorithm): number {
    switch (algorithm) {
      case CipherAlgorithm.AES_128_CBC:
      case CipherAlgorithm.AES_128_GCM:
      case CipherAlgorithm.AES_128_CTR:
        return 16; // 128 bits
      case CipherAlgorithm.AES_192_CBC:
      case CipherAlgorithm.AES_192_GCM:
      case CipherAlgorithm.AES_192_CTR:
        return 24; // 192 bits
      case CipherAlgorithm.AES_256_CBC:
      case CipherAlgorithm.AES_256_GCM:
      case CipherAlgorithm.AES_256_CTR:
      case CipherAlgorithm.CHACHA20:
      case CipherAlgorithm.CHACHA20_POLY1305:
        return 32; // 256 bits
      default:
        return 32; // Default to 256 bits
    }
  }

  /**
   * Get supported algorithms
   */
  static getSupportedAlgorithms(): CipherAlgorithm[] {
    return Object.values(CipherAlgorithm);
  }

  /**
   * Get supported hash algorithms
   */
  static getSupportedHashAlgorithms(): HashAlgorithm[] {
    return Object.values(HashAlgorithm);
  }

  /**
   * Get supported key derivation functions
   */
  static getSupportedKDFs(): KeyDerivationFunction[] {
    return Object.values(KeyDerivationFunction);
  }

  /**
   * Check if algorithm supports AEAD (Authenticated Encryption with Associated Data)
   */
  static isAEADAlgorithm(algorithm: CipherAlgorithm): boolean {
    return [
      CipherAlgorithm.AES_128_GCM,
      CipherAlgorithm.AES_192_GCM,
      CipherAlgorithm.AES_256_GCM,
      CipherAlgorithm.CHACHA20_POLY1305,
    ].includes(algorithm);
  }

  /**
   * Get recommended settings for different security levels
   */
  static getRecommendedSettings(level: 'basic' | 'standard' | 'high'): CryptoConfig {
    switch (level) {
      case 'basic':
        return {
          defaultAlgorithm: CipherAlgorithm.AES_128_CBC,
          defaultPadding: PaddingMode.PKCS7,
          defaultHashAlgorithm: HashAlgorithm.SHA256,
          defaultKeyLength: 16,
          defaultIterations: 10000,
        };
      case 'standard':
        return {
          defaultAlgorithm: CipherAlgorithm.AES_256_CBC,
          defaultPadding: PaddingMode.PKCS7,
          defaultHashAlgorithm: HashAlgorithm.SHA256,
          defaultKeyLength: 32,
          defaultIterations: 100000,
        };
      case 'high':
        return {
          defaultAlgorithm: CipherAlgorithm.AES_256_GCM,
          defaultPadding: PaddingMode.NONE,
          defaultHashAlgorithm: HashAlgorithm.SHA512,
          defaultKeyLength: 32,
          defaultIterations: 600000,
        };
      default:
        return this.DEFAULT_CONFIG;
    }
  }
} 