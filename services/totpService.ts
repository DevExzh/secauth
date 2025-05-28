import type { Account, AuthType, GeneratedCode } from '@/types/auth';

export class TOTPService {
  /**
   * Generate TOTP code for an account using a simple demo implementation
   */
  static generateCode(account: Account): GeneratedCode {
    const now = Date.now();
    const period = account.period || 30;
    
    let code: string;
    
    try {
      // Use simple demo implementation to avoid crypto dependencies
      code = this.generateSimpleCode(account, now);
    } catch (error) {
      console.error('Error generating TOTP code:', error);
      // Return a placeholder code if generation fails
      code = '000000';
    }
    
    // Calculate time remaining for TOTP
    const timeRemaining = account.type === 'TOTP' 
      ? period - Math.floor((now / 1000) % period)
      : period;
    
    return {
      code: this.formatCode(code),
      timeRemaining,
      period,
    };
  }
  
  /**
   * Generate a simple demo code based on time and account
   */
  private static generateSimpleCode(account: Account, now: number): string {
    const period = account.period || 30;
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
   * Generate Steam-specific code
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
   * Format code with spaces for better readability
   */
  private static formatCode(code: string): string {
    if (code.length === 6) {
      return `${code.slice(0, 3)} ${code.slice(3)}`;
    }
    return code;
  }
  
  /**
   * Validate TOTP secret (always return true for demo)
   */
  static validateSecret(secret: string): boolean {
    return secret.length > 0;
  }
  
  /**
   * Parse TOTP URI (from QR codes)
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
      
      return {
        name: issuer || account,
        email: account,
        secret: params.get('secret') || '',
        type: type === 'TOTP' || type === 'HOTP' ? type : 'TOTP',
        issuer: issuer || undefined,
        algorithm: (params.get('algorithm') as any) || 'SHA1',
        digits: parseInt(params.get('digits') || '6'),
        period: parseInt(params.get('period') || '30'),
        counter: type === 'HOTP' ? parseInt(params.get('counter') || '0') : undefined,
      };
    } catch {
      return null;
    }
  }
} 