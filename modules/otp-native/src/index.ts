import OtpNativeModule from './OtpNativeModule';
export * from './OtpNative.types';

/**
 * OTP Algorithm constants
 */
export const OTP_ALGORITHMS = {
  SHA1: 'SHA1',
  SHA256: 'SHA256',
  SHA512: 'SHA512',
} as const;

/**
 * Common OTP configurations
 */
export const OTP_DEFAULTS = {
  DIGITS: 6,
  PERIOD: 30,
  ALGORITHM: OTP_ALGORITHMS.SHA1,
  STEAM_DIGITS: 5,
  MOTP_DIGITS: 6,
  MOTP_PERIOD: 10,
} as const;

/**
 * Generate TOTP code with current time
 * @param secret Base32 encoded secret
 * @param digits Number of digits (default: 6)
 * @param period Time period in seconds (default: 30)
 * @param algorithm Hash algorithm (default: SHA1)
 * @returns Generated TOTP code
 */
export function generateTOTP(
  secret: string,
  digits: number = OTP_DEFAULTS.DIGITS,
  period: number = OTP_DEFAULTS.PERIOD,
  algorithm: string = OTP_DEFAULTS.ALGORITHM
): string {
  const timeSlot = Math.floor(Date.now() / 1000 / period);
  return OtpNativeModule.generateTOTP(secret, timeSlot, digits, algorithm);
}

/**
 * Generate HOTP code
 * @param secret Base32 encoded secret
 * @param counter Counter value
 * @param digits Number of digits (default: 6)
 * @param algorithm Hash algorithm (default: SHA1)
 * @returns Generated HOTP code
 */
export function generateHOTP(
  secret: string,
  counter: number,
  digits: number = OTP_DEFAULTS.DIGITS,
  algorithm: string = OTP_DEFAULTS.ALGORITHM
): string {
  return OtpNativeModule.generateHOTP(secret, counter, digits, algorithm);
}

/**
 * Generate mOTP code with current time
 * @param secret Secret key
 * @param pin PIN code
 * @param period Time period in seconds (default: 10)
 * @returns Generated mOTP code
 */
export function generateMOTP(
  secret: string,
  pin: string,
  period: number = OTP_DEFAULTS.MOTP_PERIOD
): string {
  const timeSlot = Math.floor(Date.now() / 1000);
  return OtpNativeModule.generateMOTPWithPeriod(secret, pin, timeSlot, period);
}

/**
 * Generate Steam Guard code with current time
 * @param secret Base32 encoded secret
 * @param period Time period in seconds (default: 30)
 * @returns Generated Steam Guard code
 */
export function generateSteamGuard(
  secret: string,
  period: number = OTP_DEFAULTS.PERIOD
): string {
  const timeSlot = Math.floor(Date.now() / 1000 / period);
  return OtpNativeModule.generateSteamGuard(secret, timeSlot);
}

/**
 * Calculate remaining seconds until next OTP generation
 * @param period Time period in seconds (default: 30)
 * @returns Remaining seconds
 */
export function getRemainingSeconds(period: number = OTP_DEFAULTS.PERIOD): number {
  return period - (Math.floor(Date.now() / 1000) % period);
}

/**
 * Get current time slot for given period
 * @param period Time period in seconds (default: 30)
 * @returns Current time slot
 */
export function getCurrentTimeSlot(period: number = OTP_DEFAULTS.PERIOD): number {
  return Math.floor(Date.now() / 1000 / period);
}

// Export the native module for advanced usage
export { OtpNativeModule };

// Default export for convenience
export default {
  generateTOTP,
  generateHOTP,
  generateMOTP,
  generateSteamGuard,
  getRemainingSeconds,
  getCurrentTimeSlot,
  validateSecret: OtpNativeModule.validateSecret,
  base32Decode: OtpNativeModule.base32Decode,
  base32Encode: OtpNativeModule.base32Encode,
  // Direct access to native module methods for advanced usage
  generateMOTPWithPeriod: OtpNativeModule.generateMOTPWithPeriod,
  OTP_ALGORITHMS,
  OTP_DEFAULTS,
}; 