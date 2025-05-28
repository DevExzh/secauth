import type { Account, AccountCategory, AuthType } from '@/types/auth';

export interface ParsedTOTPData {
  name: string;
  email: string;
  secret: string;
  type: AuthType;
  issuer?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
  counter?: number;
}

/**
 * Parse TOTP URL from QR code
 * Format: otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example
 */
export const parseTOTPUrl = (url: string): ParsedTOTPData | null => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.protocol !== 'otpauth:') {
      return null;
    }

    const type = urlObj.hostname.toUpperCase() as AuthType;
    if (!['TOTP', 'HOTP'].includes(type)) {
      return null;
    }

    // Extract label (service:account)
    const label = decodeURIComponent(urlObj.pathname.substring(1));
    const [issuer, account] = label.includes(':') 
      ? label.split(':', 2) 
      : ['', label];

    // Extract parameters
    const params = new URLSearchParams(urlObj.search);
    const secret = params.get('secret');
    
    if (!secret) {
      return null;
    }

    const algorithm = params.get('algorithm') || 'SHA1';
    const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    
    const parsedData: ParsedTOTPData = {
      name: params.get('issuer') || issuer || 'Unknown Service',
      email: account || 'unknown@example.com',
      secret: secret,
      type: type,
      issuer: params.get('issuer') || issuer,
      algorithm: validAlgorithms.includes(algorithm) ? algorithm as 'SHA1' | 'SHA256' | 'SHA512' : 'SHA1',
      digits: parseInt(params.get('digits') || '6'),
      period: parseInt(params.get('period') || '30'),
    };

    if (type === 'HOTP') {
      parsedData.counter = parseInt(params.get('counter') || '0');
    }

    return parsedData;
  } catch (error) {
    console.error('Error parsing TOTP URL:', error);
    return null;
  }
};

/**
 * Determine account category based on service name
 */
export const determineCategory = (serviceName: string): AccountCategory => {
  const name = serviceName.toLowerCase();
  
  if (name.includes('google') || name.includes('facebook') || 
      name.includes('twitter') || name.includes('instagram') || 
      name.includes('discord') || name.includes('telegram') ||
      name.includes('whatsapp') || name.includes('linkedin')) {
    return 'Social';
  }
  
  if (name.includes('bank') || name.includes('paypal') || 
      name.includes('stripe') || name.includes('coinbase') ||
      name.includes('binance') || name.includes('finance') ||
      name.includes('trading') || name.includes('crypto')) {
    return 'Finance';
  }
  
  if (name.includes('steam') || name.includes('epic') || 
      name.includes('blizzard') || name.includes('riot') ||
      name.includes('xbox') || name.includes('playstation') ||
      name.includes('nintendo') || name.includes('game')) {
    return 'Gaming';
  }
  
  if (name.includes('microsoft') || name.includes('office') || 
      name.includes('github') || name.includes('gitlab') ||
      name.includes('slack') || name.includes('zoom') ||
      name.includes('teams') || name.includes('work') ||
      name.includes('enterprise') || name.includes('corp')) {
    return 'Work';
  }
  
  return 'Other';
};

/**
 * Convert parsed TOTP data to Account object
 */
export const createAccountFromParsedData = (
  parsedData: ParsedTOTPData,
  id: string = Date.now().toString()
): Account => {
  const algorithm = parsedData.algorithm || 'SHA1';
  const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
  
  return {
    id,
    name: parsedData.name,
    email: parsedData.email,
    secret: parsedData.secret,
    type: parsedData.type,
    category: determineCategory(parsedData.name),
    issuer: parsedData.issuer,
    algorithm: validAlgorithms.includes(algorithm) ? algorithm as 'SHA1' | 'SHA256' | 'SHA512' : 'SHA1',
    digits: parsedData.digits || 6,
    period: parsedData.period || 30,
    counter: parsedData.counter,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}; 