import OtpNative from '@/modules/otp-native';
import type { Account, AuthType, GeneratedCode } from '@/types/auth';

export class OTPService {
  /**
   * Generate OTP code for an account using native implementation
   */
  static generateCode(account: Account): GeneratedCode {
    const now = Date.now();
    const period = account.period || 30;
    
    let code: string;
    
    try {
      switch (account.type) {
        case 'TOTP':
          code = OtpNative.generateTOTP(
            account.secret,
            Math.floor(now / 1000),
            account.digits || 6,
            account.algorithm || 'SHA1'
          );
          break;
        case 'HOTP':
          code = OtpNative.generateHOTP(
            account.secret,
            account.counter || 0,
            account.digits || 6,
            account.algorithm || 'SHA1'
          );
          break;
        case 'mOTP':
          // mOTP requires a PIN, use default or account PIN
          code = OtpNative.generateMOTP(
            account.secret,
            account.pin || '0000',
            Math.floor(now / 1000)
          );
          break;
        case 'Steam':
          // Steam Guard always uses 30-second period, cannot be changed
          code = OtpNative.generateSteamGuard(
            account.secret,
            Math.floor(now / 1000)
          );
          break;
        default:
          code = OtpNative.generateTOTP(
            account.secret,
            Math.floor(now / 1000),
            account.digits || 6,
            account.algorithm || 'SHA1'
          );
      }
    } catch (error) {
      console.error('Error generating OTP code:', error);
      // Fallback to simple implementation if native fails
      code = this.generateSimpleCode(account, now);
    }
    
    // Calculate time remaining based on account type
    let timeRemaining: number;
    if (account.type === 'HOTP') {
      // HOTP doesn't use time-based periods
      timeRemaining = period;
    } else if (account.type === 'Steam') {
      // Steam Guard always uses 30-second period
      timeRemaining = 30 - Math.floor((now / 1000) % 30);
    } else if (account.type === 'mOTP') {
      // mOTP uses configurable period (default 10 seconds)
      const motpPeriod = account.period || 10;
      timeRemaining = motpPeriod - Math.floor((now / 1000) % motpPeriod);
    } else {
      // TOTP and other time-based OTP use configurable period
      timeRemaining = period - Math.floor((now / 1000) % period);
    }
    
    return {
      code: this.formatCode(code, account.type),
      timeRemaining,
      period: account.type === 'Steam' ? 30 : (account.type === 'mOTP' ? (account.period || 10) : period),
    };
  }
  
  /**
   * Generate mOTP code using native implementation with configurable time period
   */
  static generateMOTP(account: Account, pin: string, customPeriod?: number): GeneratedCode {
    const now = Date.now();
    const period = customPeriod || account.period || 10; // mOTP default is 10 seconds
    
    let code: string;
    
    try {
      // Use the new native method with custom period if available
      if (customPeriod && customPeriod !== 10) {
        code = OtpNative.generateMOTPWithPeriod(
          account.secret,
          pin,
          Math.floor(now / 1000),
          period
        );
      } else {
        code = OtpNative.generateMOTP(
          account.secret,
          pin,
          Math.floor(now / 1000)
        );
      }
    } catch (error) {
      console.error('Error generating mOTP code:', error);
      // Fallback to simple implementation
      code = this.generateSimpleMOTP(account.secret, pin, now, period);
    }
    
    const timeRemaining = period - Math.floor((now / 1000) % period);
    
    return {
      code: code.toLowerCase(),
      timeRemaining,
      period,
    };
  }
  
  /**
   * Generate TOTP code with custom time period
   */
  static generateTOTPWithPeriod(account: Account, customPeriod: number): GeneratedCode {
    const now = Date.now();
    const period = customPeriod;
    
    let code: string;
    
    try {
      // Calculate time slot based on custom period
      const timeSlot = Math.floor(now / 1000 / period);
      
      // Use HOTP with time slot as counter for custom period
      code = OtpNative.generateHOTP(
        account.secret,
        timeSlot,
        account.digits || 6,
        account.algorithm || 'SHA1'
      );
    } catch (error) {
      console.error('Error generating TOTP with custom period:', error);
      // Fallback to simple implementation
      code = this.generateSimpleCodeWithPeriod(account, now, period);
    }
    
    const timeRemaining = period - Math.floor((now / 1000) % period);
    
    return {
      code: this.formatCode(code, account.type),
      timeRemaining,
      period,
    };
  }
  
  /**
   * Fallback simple demo code generation
   */
  private static generateSimpleCode(account: Account, now: number): string {
    const period = account.period || 30;
    return this.generateSimpleCodeWithPeriod(account, now, period);
  }
  
  /**
   * Fallback simple demo code generation with custom period
   */
  private static generateSimpleCodeWithPeriod(account: Account, now: number, period: number): string {
    const timeSlot = Math.floor(now / 1000 / period);
    const accountHash = this.simpleHash(account.secret + account.name);
    
    let code: number;
    
    switch (account.type) {
      case 'TOTP':
        code = (timeSlot + accountHash) % 1000000;
        break;
      case 'HOTP':
        code = ((account.counter || 0) + accountHash) % 1000000;
        break;
      case 'Steam':
        return this.generateSteamCode(account.secret, timeSlot);
      default:
        code = (timeSlot + accountHash) % 1000000;
    }
    
    return code.toString().padStart(6, '0');
  }
  
  /**
   * Fallback simple mOTP generation with custom period
   */
  private static generateSimpleMOTP(secret: string, pin: string, now: number, period: number): string {
    const timeSlot = Math.floor(now / 1000 / period);
    const input = timeSlot.toString() + secret + pin;
    const hash = this.simpleHash(input);
    
    return (hash % 1000000).toString(16).padStart(6, '0').substring(0, 6);
  }
  
  /**
   * Generate Steam-specific code (fallback)
   */
  private static generateSteamCode(secret: string, timeSlot: number): string {
    const steamChars = '23456789BCDFGHJKMNPQRTVWXY';
    const hash = this.simpleHash(secret + timeSlot.toString());
    
    let steamCode = '';
    let fullCode = hash % 100000; // 5 digits for Steam
    
    for (let i = 0; i < 5; i++) {
      steamCode += steamChars[fullCode % steamChars.length];
      fullCode = Math.floor(fullCode / steamChars.length);
    }
    
    return steamCode;
  }
  
  /**
   * Simple hash function for demo purposes
   */
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Format code with spaces for better readability based on OTP type
   */
  private static formatCode(code: string, type?: AuthType): string {
    // Steam Guard codes are 5 characters and don't need formatting
    if (type === 'Steam') {
      return code;
    }
    
    // Standard 6-digit codes get formatted with a space in the middle
    if (code.length === 6) {
      return `${code.slice(0, 3)} ${code.slice(3)}`;
    }
    
    // Other lengths remain unformatted
    return code;
  }
  
  /**
   * Validate OTP secret using native implementation
   */
  static validateSecret(secret: string): boolean {
    try {
      return OtpNative.validateSecret(secret);
    } catch (error) {
      console.error('Error validating secret:', error);
      return secret.length > 0;
    }
  }
  
  /**
   * Parse OTP URI (from QR codes)
   */
  static parseOTPUri(uri: string): Partial<Account> | null {
    try {
      const url = new URL(uri);
      
      if (url.protocol !== 'otpauth:') {
        return null;
      }
      
      const type = url.hostname.toUpperCase() as AuthType;
      const pathParts = url.pathname.split('/');
      const label = decodeURIComponent(pathParts[1] || '');
      const params = new URLSearchParams(url.search);
      
      const [issuer, account] = label.includes(':') 
        ? label.split(':', 2)
        : [params.get('issuer') || '', label];
      
      // Parse period with defaults based on OTP type
      let defaultPeriod = 30;
      if (type === 'Steam') {
        defaultPeriod = 30; // Steam is always 30 seconds
      }
      
      return {
        name: issuer || account,
        email: account,
        secret: params.get('secret') || '',
        type: type === 'TOTP' || type === 'HOTP' || type === 'Steam' ? type : 'TOTP',
        issuer: issuer || undefined,
        algorithm: (params.get('algorithm') as any) || 'SHA1',
        digits: parseInt(params.get('digits') || '6'),
        period: type === 'Steam' ? 30 : parseInt(params.get('period') || defaultPeriod.toString()),
        counter: type === 'HOTP' ? parseInt(params.get('counter') || '0') : undefined,
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Base32 decode using native implementation
   */
  static base32Decode(secret: string): Uint8Array {
    try {
      return OtpNative.base32Decode(secret);
    } catch (error) {
      console.error('Error decoding base32:', error);
      return new Uint8Array();
    }
  }
  
  /**
   * Base32 encode using native implementation
   */
  static base32Encode(data: Uint8Array): string {
    try {
      return OtpNative.base32Encode(data);
    } catch (error) {
      console.error('Error encoding base32:', error);
      return '';
    }
  }
  
  /**
   * Get supported OTP types
   */
  static getSupportedTypes(): AuthType[] {
    return ['TOTP', 'HOTP', 'mOTP', 'Steam'];
  }
  
  /**
   * Get default period for OTP type
   */
  static getDefaultPeriod(type: AuthType): number {
    switch (type) {
      case 'TOTP':
        return 30;
      case 'mOTP':
        return 10;
      case 'Steam':
        return 30; // Fixed, cannot be changed
      case 'HOTP':
        return 30; // Not applicable for HOTP but provide default
      default:
        return 30;
    }
  }
  
  /**
   * Check if period is configurable for the OTP type
   */
  static isPeriodConfigurable(type: AuthType): boolean {
    return type === 'TOTP' || type === 'mOTP'; // TOTP and mOTP allow period configuration
  }
  
  /**
   * Validate period value for OTP type
   */
  static validatePeriod(type: AuthType, period: number): boolean {
    if (type === 'Steam') {
      return period === 30; // Steam must be 30 seconds
    }
    
    if (type === 'TOTP') {
      return period >= 15 && period <= 300; // 15 seconds to 5 minutes
    }
    
    if (type === 'mOTP') {
      return period >= 5 && period <= 60; // 5 seconds to 1 minute
    }
    
    return true; // HOTP doesn't use periods
  }
} 