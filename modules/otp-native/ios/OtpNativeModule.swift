import ExpoModulesCore

public class OtpNativeModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('OtpNative')` in JavaScript.
    Name("OtpNative")

    // OTP generation functions
    Function("generateTOTP") { (secret: String, timeSlot: Double, digits: Int, algorithm: String) -> String in
      return OtpGenerator.generateTOTP(secret: secret, timeSlot: UInt64(timeSlot), digits: digits, algorithm: algorithm)
    }

    Function("generateHOTP") { (secret: String, counter: Double, digits: Int, algorithm: String) -> String in
      return OtpGenerator.generateHOTP(secret: secret, counter: UInt64(counter), digits: digits, algorithm: algorithm)
    }

    Function("generateMOTP") { (secret: String, pin: String, timeSlot: Double) -> String in
      return OtpGenerator.generateMOTP(secret: secret, pin: pin, timeSlot: UInt64(timeSlot))
    }

    Function("generateMOTPWithPeriod") { (secret: String, pin: String, timeSlot: Double, period: Int) -> String in
      return OtpGenerator.generateMOTPWithPeriod(secret: secret, pin: pin, timeSlot: UInt64(timeSlot), period: period)
    }

    Function("generateSteamGuard") { (secret: String, timeSlot: Double) -> String in
      return OtpGenerator.generateSteamGuard(secret: secret, timeSlot: UInt64(timeSlot))
    }

    // Utility functions
    Function("validateSecret") { (secret: String) -> Bool in
      return OtpGenerator.validateSecret(secret: secret)
    }

    Function("base32Decode") { (secret: String) -> Data in
      return OtpGenerator.base32Decode(input: secret)
    }

    Function("base32Encode") { (data: Data) -> String in
      return OtpGenerator.base32Encode(data: data)
    }
  }
}
