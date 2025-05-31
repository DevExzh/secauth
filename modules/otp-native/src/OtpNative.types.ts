// OTP Native Module Types

export type OtpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

export type TOTPOptions = {
  secret: string;
  timeSlot: number;
  digits: number;
  algorithm: OtpAlgorithm;
};

export type HOTPOptions = {
  secret: string;
  counter: number;
  digits: number;
  algorithm: OtpAlgorithm;
};

export type MOTPOptions = {
  secret: string;
  pin: string;
  timeSlot: number;
};

export type MOTPWithPeriodOptions = {
  secret: string;
  pin: string;
  timeSlot: number;
  period: number;
};

export type SteamGuardOptions = {
  secret: string;
  timeSlot: number;
};

// Empty events interface since this module doesn't emit events
export type OtpNativeModuleEvents = {}; 