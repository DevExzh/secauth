package dev.exzh.expo.otp

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class OtpNativeModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('OtpNative')` in JavaScript.
    Name("OtpNative")

    // OTP generation functions
    Function("generateTOTP") { secret: String, timeSlot: Double, digits: Int, algorithm: String ->
      generateTOTPNative(secret, timeSlot.toLong(), digits, algorithm)
    }

    Function("generateHOTP") { secret: String, counter: Double, digits: Int, algorithm: String ->
      generateHOTPNative(secret, counter.toLong(), digits, algorithm)
    }

    Function("generateMOTP") { secret: String, pin: String, timeSlot: Double ->
      generateMOTPNative(secret, pin, timeSlot.toLong())
    }

    Function("generateMOTPWithPeriod") { secret: String, pin: String, timeSlot: Double, period: Int ->
      generateMOTPWithPeriodNative(secret, pin, timeSlot.toLong(), period)
    }

    Function("generateSteamGuard") { secret: String, timeSlot: Double ->
      generateSteamGuardNative(secret, timeSlot.toLong())
    }

    // Utility functions
    Function("validateSecret") { secret: String ->
      validateSecretNative(secret)
    }

    Function("base32Decode") { secret: String ->
      base32DecodeNative(secret)
    }

    Function("base32Encode") { data: ByteArray ->
      base32EncodeNative(data)
    }
  }

  // Native method declarations
  private external fun generateTOTPNative(secret: String, timeSlot: Long, digits: Int, algorithm: String): String
  private external fun generateHOTPNative(secret: String, counter: Long, digits: Int, algorithm: String): String
  private external fun generateMOTPNative(secret: String, pin: String, timeSlot: Long): String
  private external fun generateMOTPWithPeriodNative(secret: String, pin: String, timeSlot: Long, period: Int): String
  private external fun generateSteamGuardNative(secret: String, timeSlot: Long): String
  private external fun validateSecretNative(secret: String): Boolean
  private external fun base32DecodeNative(secret: String): ByteArray
  private external fun base32EncodeNative(data: ByteArray): String

  companion object {
    init {
      System.loadLibrary("otpnative")
    }
  }
}
