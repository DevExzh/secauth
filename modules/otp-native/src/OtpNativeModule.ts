import { NativeModule, requireNativeModule } from 'expo';

import { OtpNativeModuleEvents } from './OtpNative.types';

declare class OtpNativeModule extends NativeModule<OtpNativeModuleEvents> {
  /**
   * Generate TOTP (Time-based One-Time Password) code
   * @param secret Base32 encoded secret
   * @param timeSlot Current time slot (seconds since epoch / period)
   * @param digits Number of digits in the output code (6-8)
   * @param algorithm Hash algorithm (SHA1, SHA256, SHA512)
   * @returns Generated OTP code
   */
  generateTOTP(secret: string, timeSlot: number, digits: number, algorithm: string): string;

  /**
   * Generate HOTP (HMAC-based One-Time Password) code
   * @param secret Base32 encoded secret
   * @param counter Counter value
   * @param digits Number of digits in the output code (6-8)
   * @param algorithm Hash algorithm (SHA1, SHA256, SHA512)
   * @returns Generated OTP code
   */
  generateHOTP(secret: string, counter: number, digits: number, algorithm: string): string;

  /**
   * Generate mOTP (Mobile One-Time Password) code
   * @param secret Secret key
   * @param pin PIN code
   * @param timeSlot Current time slot
   * @returns Generated mOTP code (6 character hex)
   */
  generateMOTP(secret: string, pin: string, timeSlot: number): string;

  /**
   * Generate mOTP with custom period
   * @param secret Secret key
   * @param pin PIN code
   * @param timeSlot Current time slot
   * @param period Time period in seconds
   * @returns Generated mOTP code (6 character hex)
   */
  generateMOTPWithPeriod(secret: string, pin: string, timeSlot: number, period: number): string;

  /**
   * Generate Steam Guard code
   * @param secret Base32 encoded secret
   * @param timeSlot Current time slot
   * @returns Generated Steam code (5 character alphanumeric)
   */
  generateSteamGuard(secret: string, timeSlot: number): string;

  /**
   * Validate if a secret is properly formatted Base32
   * @param secret Secret to validate
   * @returns True if valid Base32, false otherwise
   */
  validateSecret(secret: string): boolean;

  /**
   * Decode Base32 string to byte array
   * @param secret Base32 encoded string
   * @returns Decoded byte array
   */
  base32Decode(secret: string): Uint8Array;

  /**
   * Encode byte array to Base32 string
   * @param data Byte array to encode
   * @returns Base32 encoded string
   */
  base32Encode(data: Uint8Array): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<OtpNativeModule>('OtpNative');
