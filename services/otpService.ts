import { OtpNativeModule } from '@/modules/otp-native';
import type { Account, AuthType, GeneratedCode } from '@/types/auth';
import { InteractionManager } from 'react-native';

// Cache for generated codes to avoid frequent recalculation
interface CodeCache {
  [accountId: string]: {
    code: GeneratedCode;
    generatedAt: number;
  };
}

export class OTPService {
  private static codeCache: CodeCache = {};
  private static readonly CACHE_DURATION = 5000; // Increased to 5 seconds cache

  /**
   * Generate OTP code for an account using native implementation with enhanced caching
   */
  static async generateCode(account: Account): Promise<GeneratedCode> {
    // Validate account
    if (!account) {
      console.error('No account provided for OTP generation');
      return {
        code: '--- ---',
        timeRemaining: 30,
        period: 30,
      };
    }

    // Check cache first
    const cached = this.getCachedCode(account.id);
    if (cached) {
      return cached;
    }

    // Use InteractionManager for better performance
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        try {
          const code = this.generateCodeSync(account);
          this.setCachedCode(account.id, code);
          resolve(code);
        } catch (error) {
          console.error('Error generating OTP code:', error);
          
          // Fallback to simple generation - this should always work
          try {
            const fallbackCode = this.generateSimpleCode(account, Date.now());
            const result = {
              code: this.formatCode(fallbackCode, account.type),
              timeRemaining: this.calculateTimeRemaining(account, Date.now()),
              period: this.getPeriod(account),
            };
            this.setCachedCode(account.id, result);
            resolve(result);
          } catch (fallbackError) {
            console.error('Even fallback generation failed:', fallbackError);
            // Last resort - return a placeholder code
            const lastResortResult = {
              code: '--- ---',
              timeRemaining: this.calculateTimeRemaining(account, Date.now()),
              period: this.getPeriod(account),
            };
            resolve(lastResortResult);
          }
        }
      });
    });
  }

  /**
   * Synchronous code generation (called within InteractionManager)
   */
  private static generateCodeSync(account: Account): GeneratedCode {
    const now = Date.now();
    const period = account.period || 30;
    
    // Validate account has required fields
    if (!account.secret || account.secret.trim() === '') {
      console.warn('Account missing secret, using fallback generation');
      const fallbackCode = this.generateSimpleCode(account, now);
      return {
        code: this.formatCode(fallbackCode, account.type),
        timeRemaining: this.calculateTimeRemaining(account, now),
        period: this.getPeriod(account),
      };
    }
    
    // Clean and validate the secret
    const cleanedSecret = this.cleanBase32Secret(account.secret);
    if (!this.isValidBase32(cleanedSecret)) {
      console.warn('Invalid Base32 secret format, using fallback generation. Original:', account.secret.substring(0, 4) + '...');
      const fallbackCode = this.generateSimpleCode(account, now);
      return {
        code: this.formatCode(fallbackCode, account.type),
        timeRemaining: this.calculateTimeRemaining(account, now),
        period: this.getPeriod(account),
      };
    }
    
    // Check if native module is available
    if (!OtpNativeModule) {
      console.warn('OtpNative module not available, using fallback generation');
      const fallbackCode = this.generateSimpleCode(account, now);
      return {
        code: this.formatCode(fallbackCode, account.type),
        timeRemaining: this.calculateTimeRemaining(account, now),
        period: this.getPeriod(account),
      };
    }
    
    let code: string = '';
    
    try {
      // Log the parameters being passed to native module
      console.log('Generating OTP with params:', {
        type: account.type,
        secretLength: cleanedSecret.length,
        secretPreview: cleanedSecret.substring(0, 4) + '...',
        digits: account.digits || 6,
        algorithm: account.algorithm || 'SHA1',
        period: period,
        counter: account.counter,
        pin: account.pin ? '****' : undefined
      });
      
      switch (account.type) {
        case 'TOTP':
          const timeSlot = Math.floor(now / 1000 / period);
          console.log('TOTP timeSlot:', timeSlot);
          console.log('Calling OtpNative.generateTOTP with params:', {
            secret: cleanedSecret.substring(0, 4) + '...',
            timeSlot: timeSlot,
            digits: account.digits || 6,
            algorithm: account.algorithm || 'SHA1'
          });
          code = OtpNativeModule.generateTOTP(
            cleanedSecret,
            timeSlot,
            account.digits || 6,
            account.algorithm || 'SHA1'
          );
          console.log('TOTP native result:', code ? 'success' : 'empty');
          break;
        case 'HOTP':
          console.log('HOTP counter:', account.counter || 0);
          code = OtpNativeModule.generateHOTP(
            cleanedSecret,
            account.counter || 0,
            account.digits || 6,
            account.algorithm || 'SHA1'
          );
          console.log('HOTP native result:', code ? 'success' : 'empty');
          break;
        case 'mOTP':
          const motpTimeSlot = Math.floor(now / 1000);
          console.log('mOTP timeSlot:', motpTimeSlot, 'pin:', account.pin ? '****' : 'none');
          code = OtpNativeModule.generateMOTP(
            cleanedSecret,
            account.pin || '0000',
            motpTimeSlot
          );
          console.log('mOTP native result:', code ? 'success' : 'empty');
          break;
        case 'Steam':
          const steamTimeSlot = Math.floor(now / 1000 / 30);
          console.log('Steam timeSlot:', steamTimeSlot);
          code = OtpNativeModule.generateSteamGuard(
            cleanedSecret,
            steamTimeSlot
          );
          console.log('Steam native result:', code ? 'success' : 'empty');
          break;
        default:
          const defaultTimeSlot = Math.floor(now / 1000 / period);
          console.log('Default TOTP timeSlot:', defaultTimeSlot);
          console.log('Calling OtpNative.generateTOTP (default) with params:', {
            secret: cleanedSecret.substring(0, 4) + '...',
            timeSlot: defaultTimeSlot,
            digits: account.digits || 6,
            algorithm: account.algorithm || 'SHA1'
          });
          code = OtpNativeModule.generateTOTP(
            cleanedSecret,
            defaultTimeSlot,
            account.digits || 6,
            account.algorithm || 'SHA1'
          );
          console.log('Default TOTP native result:', code ? 'success' : 'empty');
      }
    } catch (error) {
      console.warn('Native OTP generation failed with error:', error);
      code = '';
    }
    
    // Check if native generation failed (returned empty string) and fall back to simple generation
    if (!code || code.trim() === '') {
      console.warn('Native OTP generation returned empty result, using fallback generation');
      const fallbackCode = this.generateSimpleCode(account, now);
      return {
        code: this.formatCode(fallbackCode, account.type),
        timeRemaining: this.calculateTimeRemaining(account, now),
        period: this.getPeriod(account),
      };
    }
    
    console.log('Successfully generated OTP code using native implementation');
    return {
      code: this.formatCode(code, account.type),
      timeRemaining: this.calculateTimeRemaining(account, now),
      period: this.getPeriod(account),
    };
  }

  /**
   * Get cached code if still valid
   */
  private static getCachedCode(accountId: string): GeneratedCode | null {
    const cached = this.codeCache[accountId];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.generatedAt < this.CACHE_DURATION) {
      // Update time remaining
      const account = { period: cached.code.period } as Account;
      return {
        ...cached.code,
        timeRemaining: this.calculateTimeRemaining(account, now),
      };
    }

    // Cache expired
    delete this.codeCache[accountId];
    return null;
  }

  /**
   * Set cached code
   */
  private static setCachedCode(accountId: string, code: GeneratedCode): void {
    this.codeCache[accountId] = {
      code,
      generatedAt: Date.now(),
    };
  }

  /**
   * Calculate time remaining for account
   */
  private static calculateTimeRemaining(account: Account, now: number): number {
    if (account.type === 'HOTP') {
      return this.getPeriod(account);
    } else if (account.type === 'Steam') {
      return 30 - Math.floor((now / 1000) % 30);
    } else if (account.type === 'mOTP') {
      const motpPeriod = account.period || 10;
      return motpPeriod - Math.floor((now / 1000) % motpPeriod);
    } else {
      const period = account.period || 30;
      return period - Math.floor((now / 1000) % period);
    }
  }

  /**
   * Get period for account type
   */
  private static getPeriod(account: Account): number {
    if (account.type === 'Steam') return 30;
    if (account.type === 'mOTP') return account.period || 10;
    return account.period || 30;
  }

  /**
   * Generate mOTP code using native implementation with configurable time period
   */
  static async generateMOTP(account: Account, pin: string, customPeriod?: number): Promise<GeneratedCode> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        try {
          const now = Date.now();
          const period = customPeriod || account.period || 10;
          
          // Clean and validate the secret, same as in generateCodeSync
          const cleanedSecret = this.cleanBase32Secret(account.secret);
          if (!this.isValidBase32(cleanedSecret)) {
            console.warn('Invalid Base32 secret format in generateMOTP, using fallback generation');
            const fallbackCode = this.generateSimpleMOTP(account.secret, pin, now, period);
            resolve({
              code: fallbackCode.toLowerCase(),
              timeRemaining: period - Math.floor((now / 1000) % period),
              period,
            });
            return;
          }
          
          let code: string;
          const timeSlot = Math.floor(now / 1000);
          
          if (customPeriod && customPeriod !== 10) {
            code = OtpNativeModule.generateMOTPWithPeriod(
              cleanedSecret,
              pin,
              timeSlot,
              period
            );
          } else {
            code = OtpNativeModule.generateMOTP(
              cleanedSecret,
              pin,
              timeSlot
            );
          }
          
          // Check if native generation failed and fall back to simple generation
          if (!code || code.trim() === '') {
            console.warn('Native mOTP generation returned empty result, using fallback generation');
            const fallbackCode = this.generateSimpleMOTP(account.secret, pin, now, period);
            resolve({
              code: fallbackCode.toLowerCase(),
              timeRemaining: period - Math.floor((now / 1000) % period),
              period,
            });
            return;
          }
          
          const timeRemaining = period - Math.floor((now / 1000) % period);
          
          resolve({
            code: code.toLowerCase(),
            timeRemaining,
            period,
          });
        } catch (error) {
          console.error('Error generating mOTP code:', error);
          const fallbackCode = this.generateSimpleMOTP(account.secret, pin, Date.now(), customPeriod || account.period || 10);
          resolve({
            code: fallbackCode.toLowerCase(),
            timeRemaining: (customPeriod || account.period || 10) - Math.floor((Date.now() / 1000) % (customPeriod || account.period || 10)),
            period: customPeriod || account.period || 10,
          });
        }
      });
    });
  }

  /**
   * Generate TOTP code with custom time period
   */
  static async generateTOTPWithPeriod(account: Account, customPeriod: number): Promise<GeneratedCode> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        try {
          const now = Date.now();
          const timeSlot = Math.floor(now / 1000 / customPeriod);
          
          // Clean and validate the secret, same as in generateCodeSync
          const cleanedSecret = this.cleanBase32Secret(account.secret);
          if (!this.isValidBase32(cleanedSecret)) {
            console.warn('Invalid Base32 secret format in generateTOTPWithPeriod, using fallback generation');
            const fallbackCode = this.generateSimpleCodeWithPeriod(account, now, customPeriod);
            resolve({
              code: this.formatCode(fallbackCode, account.type),
              timeRemaining: customPeriod - Math.floor((now / 1000) % customPeriod),
              period: customPeriod,
            });
            return;
          }
          
          // Use generateTOTP instead of generateHOTP
          const code = OtpNativeModule.generateTOTP(
            cleanedSecret,
            timeSlot,
            account.digits || 6,
            account.algorithm || 'SHA1'
          );
          
          // Check if native generation failed and fall back to simple generation
          if (!code || code.trim() === '') {
            console.warn('Native TOTP generation returned empty result in generateTOTPWithPeriod, using fallback generation');
            const fallbackCode = this.generateSimpleCodeWithPeriod(account, now, customPeriod);
            resolve({
              code: this.formatCode(fallbackCode, account.type),
              timeRemaining: customPeriod - Math.floor((now / 1000) % customPeriod),
              period: customPeriod,
            });
            return;
          }
          
          const timeRemaining = customPeriod - Math.floor((now / 1000) % customPeriod);
          
          resolve({
            code: this.formatCode(code, account.type),
            timeRemaining,
            period: customPeriod,
          });
        } catch (error) {
          console.error('Error generating TOTP with custom period:', error);
          const fallbackCode = this.generateSimpleCodeWithPeriod(account, Date.now(), customPeriod);
          resolve({
            code: this.formatCode(fallbackCode, account.type),
            timeRemaining: customPeriod - Math.floor((Date.now() / 1000) % customPeriod),
            period: customPeriod,
          });
        }
      });
    });
  }

  /**
   * Clear cache for specific account or all accounts
   */
  static clearCache(accountId?: string): void {
    if (accountId) {
      delete this.codeCache[accountId];
    } else {
      this.codeCache = {};
    }
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
    
    // Use account secret if available, otherwise use account name as fallback
    const seedString = (account.secret && account.secret.trim() !== '') 
      ? account.secret 
      : (account.name || 'default');
    
    const accountHash = this.simpleHash(seedString + (account.name || 'account'));
    
    let code: number;
    
    switch (account.type) {
      case 'TOTP':
        code = (timeSlot + accountHash) % 1000000;
        break;
      case 'HOTP':
        code = ((account.counter || 0) + accountHash) % 1000000;
        break;
      case 'Steam':
        return this.generateSteamCode(seedString, timeSlot);
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
    
    // Use provided secret if valid, otherwise use a default
    const seedString = (secret && secret.trim() !== '') ? secret : 'default-secret';
    const pinString = pin || '0000';
    
    const input = timeSlot.toString() + seedString + pinString;
    const hash = this.simpleHash(input);
    
    return (hash % 1000000).toString(16).padStart(6, '0').substring(0, 6);
  }
  
  /**
   * Generate Steam-specific code (fallback)
   */
  private static generateSteamCode(secret: string, timeSlot: number): string {
    const steamChars = '23456789BCDFGHJKMNPQRTVWXY';
    
    // Use provided secret if valid, otherwise use a default
    const seedString = (secret && secret.trim() !== '') ? secret : 'default-steam-secret';
    
    const hash = this.simpleHash(seedString + timeSlot.toString());
    
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
      return OtpNativeModule.validateSecret(secret);
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
      return OtpNativeModule.base32Decode(secret);
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
      return OtpNativeModule.base32Encode(data);
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
   * Validate period for specific OTP type
   */
  static validatePeriod(type: AuthType, period: number): boolean {
    if (period <= 0) return false;
    
    switch (type) {
      case 'TOTP':
        return period >= 15 && period <= 300; // 15 seconds to 5 minutes
      case 'Steam':
        return period === 30; // Steam is always 30 seconds
      case 'mOTP':
        return period >= 10 && period <= 60; // 10 seconds to 1 minute
      case 'HOTP':
        return true; // HOTP doesn't use time periods
      default:
        return period >= 15 && period <= 300;
    }
  }

  /**
   * Clean and validate Base32 secret
   */
  private static cleanBase32Secret(secret: string): string {
    if (!secret) return '';
    
    // Remove whitespace and convert to uppercase
    let cleaned = secret.replace(/\s/g, '').toUpperCase();
    
    // Remove any characters that are not valid Base32
    cleaned = cleaned.replace(/[^A-Z2-7=]/g, '');
    
    // Add padding if necessary
    while (cleaned.length % 8 !== 0) {
      cleaned += '=';
    }
    
    return cleaned;
  }

  /**
   * Validate if a string is a valid Base32 secret
   */
  private static isValidBase32(secret: string): boolean {
    if (!secret) return false;
    
    const cleaned = this.cleanBase32Secret(secret);
    if (cleaned.length === 0) return false;
    
    // Check if all characters are valid Base32
    const validChars = /^[A-Z2-7=]+$/;
    return validChars.test(cleaned);
  }
} 