import type { Account, GeneratedCode } from '@/types/auth';

export class SimpleTOTPService {
  /**
   * Simple TOTP implementation for demo purposes
   * This is a fallback that generates predictable codes for demonstration
   */
  static generateCode(account: Account): GeneratedCode {
    const now = Date.now();
    const period = account.period || 30;
    
    // Calculate time remaining
    const timeRemaining = period - Math.floor((now / 1000) % period);
    
    // Generate a simple demo code based on time and account
    const timeSlot = Math.floor(now / 1000 / period);
    const accountHash = this.simpleHash(account.secret + account.name);
    const code = ((timeSlot + accountHash) % 1000000).toString().padStart(6, '0');
    
    return {
      code: this.formatCode(code),
      timeRemaining,
      period,
    };
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
   * Always return true for demo purposes
   */
  static validateSecret(secret: string): boolean {
    return secret.length > 0;
  }
} 