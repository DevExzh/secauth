import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: LocalAuthentication.AuthenticationType;
}

export class BiometricAuthService {
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private static readonly PIN_KEY = 'user_pin';

  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  static async getAvailableTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  }

  /**
   * Check if biometric authentication is enabled in app settings
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Enable or disable biometric authentication
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.error('Error setting biometric enabled status:', error);
      throw new Error('Failed to save biometric preference');
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticateWithBiometrics(promptMessage: string): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const types = await this.getAvailableTypes();
        return {
          success: true,
          biometryType: types[0]
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Authentication error occurred'
      };
    }
  }

  /**
   * Set user PIN
   */
  static async setPIN(pin: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.PIN_KEY, pin);
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw new Error('Failed to save PIN');
    }
  }

  /**
   * Verify user PIN
   */
  static async verifyPIN(pin: string): Promise<boolean> {
    try {
      const storedPIN = await SecureStore.getItemAsync(this.PIN_KEY);
      return storedPIN === pin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  /**
   * Check if PIN is set
   */
  static async hasPIN(): Promise<boolean> {
    try {
      const pin = await SecureStore.getItemAsync(this.PIN_KEY);
      return pin !== null && pin.length > 0;
    } catch (error) {
      console.error('Error checking PIN:', error);
      return false;
    }
  }

  /**
   * Remove PIN
   */
  static async removePIN(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.PIN_KEY);
    } catch (error) {
      console.error('Error removing PIN:', error);
      throw new Error('Failed to remove PIN');
    }
  }
} 