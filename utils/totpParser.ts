import type { Account, AccountCategory } from '@/types/auth';

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
 * Create Account object from parsed OTP data
 */
export const createAccountFromOTPData = (
  parsedData: Partial<Account>,
  id: string = Date.now().toString()
): Account => {
  const algorithm = parsedData.algorithm || 'SHA1';
  const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
  
  return {
    id,
    name: parsedData.name || 'Unknown Service',
    email: parsedData.email || 'unknown@example.com',
    secret: parsedData.secret || '',
    type: parsedData.type || 'TOTP',
    category: determineCategory(parsedData.name || ''),
    issuer: parsedData.issuer,
    algorithm: validAlgorithms.includes(algorithm) ? algorithm as 'SHA1' | 'SHA256' | 'SHA512' : 'SHA1',
    digits: parsedData.digits || 6,
    period: parsedData.period || 30,
    counter: parsedData.counter,
    pin: parsedData.pin,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}; 