import ExpoModulesCore
import CommonCrypto
import Security
import Foundation

public class CryptoNativeModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CryptoNative')` in JavaScript.
    Name("CryptoNative")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Core Cryptographic Functions
    AsyncFunction("encrypt") { (data: String, key: String, options: [String: Any]) -> [String: Any] in
      return try self.performEncryption(data: data, key: key, options: options)
    }

    AsyncFunction("decrypt") { (ciphertext: String, key: String, options: [String: Any]) -> String in
      return try self.performDecryption(ciphertext: ciphertext, key: key, options: options)
    }

    // Key Management
    AsyncFunction("generateKey") { (length: Int) -> String in
      return try self.generateRandomKey(length: length)
    }

    AsyncFunction("deriveKey") { (password: String, options: [String: Any]) -> [String: String] in
      return try self.deriveKeyFromPassword(password: password, options: options)
    }

    AsyncFunction("deriveKeyWithSalt") { (password: String, salt: String, options: [String: Any]) -> String in
      return try self.deriveKeyWithExistingSalt(password: password, salt: salt, options: options)
    }

    // Hashing and HMAC
    AsyncFunction("hash") { (data: String, algorithm: String) -> String in
      return try self.computeHash(data: data, algorithm: algorithm)
    }

    AsyncFunction("hmac") { (data: String, key: String, options: [String: Any]) -> String in
      return try self.computeHMAC(data: data, key: key, options: options)
    }

    // Random Number Generation
    AsyncFunction("randomBytes") { (options: [String: Any]) -> String in
      return try self.generateRandomBytes(options: options)
    }

    AsyncFunction("randomInt") { (min: Int, max: Int) -> Int in
      return try self.generateRandomInteger(min: min, max: max)
    }

    // Utility Functions
    AsyncFunction("encodeBase64") { (data: String) -> String in
      return Data(data.utf8).base64EncodedString()
    }

    AsyncFunction("decodeBase64") { (data: String) -> String in
      guard let decodedData = Data(base64Encoded: data) else {
        throw CryptoError.invalidInput("Invalid base64 string")
      }
      return String(data: decodedData, encoding: .utf8) ?? ""
    }

    AsyncFunction("hexToBase64") { (hex: String) -> String in
      return try self.convertHexToBase64(hex: hex)
    }

    AsyncFunction("base64ToHex") { (base64: String) -> String in
      return try self.convertBase64ToHex(base64: base64)
    }

    // Security Utilities
    AsyncFunction("secureCompare") { (a: String, b: String) -> Bool in
      return self.performSecureComparison(a: a, b: b)
    }
  }

  // MARK: - Private Implementation

  private enum CryptoError: Error {
    case invalidInput(String)
    case encryptionFailed(String)
    case decryptionFailed(String)
    case keyGenerationFailed(String)
    case hashingFailed(String)
    case unsupportedAlgorithm(String)
  }

  private func performEncryption(data: String, key: String, options: [String: Any]) throws -> [String: Any] {
    guard let dataBytes = Data(base64Encoded: data),
          let keyBytes = Data(base64Encoded: key) else {
      throw CryptoError.invalidInput("Invalid base64 input")
    }

    let algorithm = options["algorithm"] as? String ?? "AES_256_CBC"
    let padding = options["padding"] as? String ?? "PKCS7"
    
    var iv: Data
    if let ivString = options["iv"] as? String,
       let ivData = Data(base64Encoded: ivString) {
      iv = ivData
    } else {
      iv = try generateRandomData(length: getIVSize(for: algorithm))
    }

    let result = try encryptAES(data: dataBytes, key: keyBytes, algorithm: algorithm, iv: iv)
    
    var response: [String: Any] = [
      "ciphertext": result.ciphertext.base64EncodedString(),
      "iv": iv.base64EncodedString()
    ]
    
    if let tag = result.tag {
      response["tag"] = tag.base64EncodedString()
    }
    
    return response
  }

  private func performDecryption(ciphertext: String, key: String, options: [String: Any]) throws -> String {
    guard let ciphertextBytes = Data(base64Encoded: ciphertext),
          let keyBytes = Data(base64Encoded: key),
          let ivString = options["iv"] as? String,
          let ivBytes = Data(base64Encoded: ivString) else {
      throw CryptoError.invalidInput("Invalid base64 input")
    }

    let algorithm = options["algorithm"] as? String ?? "AES_256_CBC"
    
    var tag: Data?
    if let tagString = options["tag"] as? String {
      tag = Data(base64Encoded: tagString)
    }

    let result = try decryptAES(ciphertext: ciphertextBytes, key: keyBytes, algorithm: algorithm, iv: ivBytes, tag: tag)
    return result.base64EncodedString()
  }

  private func encryptAES(data: Data, key: Data, algorithm: String, iv: Data) throws -> (ciphertext: Data, tag: Data?) {
    let cryptAlgorithm: CCAlgorithm = CCAlgorithm(kCCAlgorithmAES)
    let options: CCOptions = CCOptions(kCCOptionPKCS7Padding)
    
    let bufferSize = data.count + kCCBlockSizeAES128
    var buffer = Data(count: bufferSize)
    var numBytesEncrypted: size_t = 0

    let cryptStatus = buffer.withUnsafeMutableBytes { bufferBytes in
      data.withUnsafeBytes { dataBytes in
        key.withUnsafeBytes { keyBytes in
          iv.withUnsafeBytes { ivBytes in
            CCCrypt(
              CCOperation(kCCEncrypt),
              cryptAlgorithm,
              options,
              keyBytes.bindMemory(to: UInt8.self).baseAddress,
              key.count,
              ivBytes.bindMemory(to: UInt8.self).baseAddress,
              dataBytes.bindMemory(to: UInt8.self).baseAddress,
              data.count,
              bufferBytes.bindMemory(to: UInt8.self).baseAddress,
              bufferSize,
              &numBytesEncrypted
            )
          }
        }
      }
    }

    guard cryptStatus == kCCSuccess else {
      throw CryptoError.encryptionFailed("AES encryption failed with status: \(cryptStatus)")
    }

    buffer.removeSubrange(numBytesEncrypted..<buffer.count)
    return (ciphertext: buffer, tag: nil) // GCM mode would require different implementation
  }

  private func decryptAES(ciphertext: Data, key: Data, algorithm: String, iv: Data, tag: Data?) throws -> Data {
    let cryptAlgorithm: CCAlgorithm = CCAlgorithm(kCCAlgorithmAES)
    let options: CCOptions = CCOptions(kCCOptionPKCS7Padding)
    
    let bufferSize = ciphertext.count + kCCBlockSizeAES128
    var buffer = Data(count: bufferSize)
    var numBytesDecrypted: size_t = 0

    let cryptStatus = buffer.withUnsafeMutableBytes { bufferBytes in
      ciphertext.withUnsafeBytes { ciphertextBytes in
        key.withUnsafeBytes { keyBytes in
          iv.withUnsafeBytes { ivBytes in
            CCCrypt(
              CCOperation(kCCDecrypt),
              cryptAlgorithm,
              options,
              keyBytes.bindMemory(to: UInt8.self).baseAddress,
              key.count,
              ivBytes.bindMemory(to: UInt8.self).baseAddress,
              ciphertextBytes.bindMemory(to: UInt8.self).baseAddress,
              ciphertext.count,
              bufferBytes.bindMemory(to: UInt8.self).baseAddress,
              bufferSize,
              &numBytesDecrypted
            )
          }
        }
      }
    }

    guard cryptStatus == kCCSuccess else {
      throw CryptoError.decryptionFailed("AES decryption failed with status: \(cryptStatus)")
    }

    buffer.removeSubrange(numBytesDecrypted..<buffer.count)
    return buffer
  }

  private func generateRandomKey(length: Int) throws -> String {
    let keyData = try generateRandomData(length: length)
    return keyData.base64EncodedString()
  }

  private func generateRandomData(length: Int) throws -> Data {
    var data = Data(count: length)
    let result = data.withUnsafeMutableBytes { bytes in
      SecRandomCopyBytes(kSecRandomDefault, length, bytes.bindMemory(to: UInt8.self).baseAddress!)
    }
    
    guard result == errSecSuccess else {
      throw CryptoError.keyGenerationFailed("Failed to generate random data")
    }
    
    return data
  }

  private func deriveKeyFromPassword(password: String, options: [String: Any]) throws -> [String: String] {
    let kdf = options["kdf"] as? String ?? "PBKDF2"
    let iterations = options["iterations"] as? Int ?? 100000
    let saltLength = options["saltLength"] as? Int ?? 32
    let keyLength = options["keyLength"] as? Int ?? 32

    let salt = try generateRandomData(length: saltLength)
    let key = try deriveKeyPBKDF2(password: password, salt: salt, iterations: iterations, keyLength: keyLength)

    return [
      "key": key.base64EncodedString(),
      "salt": salt.base64EncodedString()
    ]
  }

  private func deriveKeyWithExistingSalt(password: String, salt: String, options: [String: Any]) throws -> String {
    guard let saltData = Data(base64Encoded: salt) else {
      throw CryptoError.invalidInput("Invalid salt")
    }

    let iterations = options["iterations"] as? Int ?? 100000
    let keyLength = options["keyLength"] as? Int ?? 32

    let key = try deriveKeyPBKDF2(password: password, salt: saltData, iterations: iterations, keyLength: keyLength)
    return key.base64EncodedString()
  }

  private func deriveKeyPBKDF2(password: String, salt: Data, iterations: Int, keyLength: Int) throws -> Data {
    var derivedKey = Data(count: keyLength)
    
    let result = derivedKey.withUnsafeMutableBytes { derivedKeyBytes in
      salt.withUnsafeBytes { saltBytes in
        CCKeyDerivationPBKDF(
          CCPBKDFAlgorithm(kCCPBKDF2),
          password,
          password.utf8.count,
          saltBytes.bindMemory(to: UInt8.self).baseAddress,
          salt.count,
          CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
          UInt32(iterations),
          derivedKeyBytes.bindMemory(to: UInt8.self).baseAddress,
          keyLength
        )
      }
    }

    guard result == kCCSuccess else {
      throw CryptoError.keyGenerationFailed("PBKDF2 key derivation failed")
    }

    return derivedKey
  }

  private func computeHash(data: String, algorithm: String) throws -> String {
    guard let inputData = Data(base64Encoded: data) else {
      throw CryptoError.invalidInput("Invalid base64 data")
    }

    let hashData: Data
    
    switch algorithm.uppercased() {
    case "SHA1":
      hashData = inputData.sha1()
    case "SHA256":
      hashData = inputData.sha256()
    case "SHA384":
      hashData = inputData.sha384()
    case "SHA512":
      hashData = inputData.sha512()
    case "MD5":
      hashData = inputData.md5()
    default:
      throw CryptoError.unsupportedAlgorithm("Unsupported hash algorithm: \(algorithm)")
    }

    return hashData.base64EncodedString()
  }

  private func computeHMAC(data: String, key: String, options: [String: Any]) throws -> String {
    guard let inputData = Data(base64Encoded: data),
          let keyData = Data(base64Encoded: key) else {
      throw CryptoError.invalidInput("Invalid base64 input")
    }

    let algorithm = options["algorithm"] as? String ?? "SHA256"
    let hmacData = try inputData.hmac(key: keyData, algorithm: algorithm)
    
    return hmacData.base64EncodedString()
  }

  private func generateRandomBytes(options: [String: Any]) throws -> String {
    guard let length = options["length"] as? Int else {
      throw CryptoError.invalidInput("Length is required")
    }

    let randomData = try generateRandomData(length: length)
    return randomData.base64EncodedString()
  }

  private func generateRandomInteger(min: Int, max: Int) throws -> Int {
    guard min < max else {
      throw CryptoError.invalidInput("Invalid range")
    }

    let range = UInt32(max - min)
    var randomValue: UInt32 = 0
    
    let result = SecRandomCopyBytes(kSecRandomDefault, MemoryLayout<UInt32>.size, &randomValue)
    guard result == errSecSuccess else {
      throw CryptoError.keyGenerationFailed("Failed to generate random integer")
    }

    return min + Int(randomValue % range)
  }

  private func convertHexToBase64(hex: String) throws -> String {
    guard hex.count % 2 == 0 else {
      throw CryptoError.invalidInput("Invalid hex string length")
    }

    var data = Data()
    var index = hex.startIndex
    
    while index < hex.endIndex {
      let nextIndex = hex.index(index, offsetBy: 2)
      let byteString = String(hex[index..<nextIndex])
      
      guard let byte = UInt8(byteString, radix: 16) else {
        throw CryptoError.invalidInput("Invalid hex character")
      }
      
      data.append(byte)
      index = nextIndex
    }

    return data.base64EncodedString()
  }

  private func convertBase64ToHex(base64: String) throws -> String {
    guard let data = Data(base64Encoded: base64) else {
      throw CryptoError.invalidInput("Invalid base64 string")
    }

    return data.map { String(format: "%02x", $0) }.joined()
  }

  private func performSecureComparison(a: String, b: String) -> Bool {
    let aData = Data(a.utf8)
    let bData = Data(b.utf8)
    
    guard aData.count == bData.count else {
      return false
    }

    var result: UInt8 = 0
    for i in 0..<aData.count {
      result |= aData[i] ^ bData[i]
    }

    return result == 0
  }

  private func getIVSize(for algorithm: String) -> Int {
    switch algorithm {
    case "AES_128_CBC", "AES_192_CBC", "AES_256_CBC",
         "AES_128_CTR", "AES_192_CTR", "AES_256_CTR":
      return 16
    case "AES_128_GCM", "AES_192_GCM", "AES_256_GCM":
      return 12
    case "CHACHA20", "CHACHA20_POLY1305":
      return 12
    default:
      return 16
    }
  }
}

// MARK: - Data Extensions for Cryptographic Operations

extension Data {
  func sha1() -> Data {
    var hash = [UInt8](repeating: 0, count: Int(CC_SHA1_DIGEST_LENGTH))
    self.withUnsafeBytes {
      _ = CC_SHA1($0.baseAddress, CC_LONG(self.count), &hash)
    }
    return Data(hash)
  }

  func sha256() -> Data {
    var hash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
    self.withUnsafeBytes {
      _ = CC_SHA256($0.baseAddress, CC_LONG(self.count), &hash)
    }
    return Data(hash)
  }

  func sha384() -> Data {
    var hash = [UInt8](repeating: 0, count: Int(CC_SHA384_DIGEST_LENGTH))
    self.withUnsafeBytes {
      _ = CC_SHA384($0.baseAddress, CC_LONG(self.count), &hash)
    }
    return Data(hash)
  }

  func sha512() -> Data {
    var hash = [UInt8](repeating: 0, count: Int(CC_SHA512_DIGEST_LENGTH))
    self.withUnsafeBytes {
      _ = CC_SHA512($0.baseAddress, CC_LONG(self.count), &hash)
    }
    return Data(hash)
  }

  func md5() -> Data {
    var hash = [UInt8](repeating: 0, count: Int(CC_MD5_DIGEST_LENGTH))
    self.withUnsafeBytes {
      _ = CC_MD5($0.baseAddress, CC_LONG(self.count), &hash)
    }
    return Data(hash)
  }

  func hmac(key: Data, algorithm: String) throws -> Data {
    let alg: CCHmacAlgorithm
    let digestLength: Int

    switch algorithm.uppercased() {
    case "SHA1":
      alg = CCHmacAlgorithm(kCCHmacAlgSHA1)
      digestLength = Int(CC_SHA1_DIGEST_LENGTH)
    case "SHA256":
      alg = CCHmacAlgorithm(kCCHmacAlgSHA256)
      digestLength = Int(CC_SHA256_DIGEST_LENGTH)
    case "SHA384":
      alg = CCHmacAlgorithm(kCCHmacAlgSHA384)
      digestLength = Int(CC_SHA384_DIGEST_LENGTH)
    case "SHA512":
      alg = CCHmacAlgorithm(kCCHmacAlgSHA512)
      digestLength = Int(CC_SHA512_DIGEST_LENGTH)
    case "MD5":
      alg = CCHmacAlgorithm(kCCHmacAlgMD5)
      digestLength = Int(CC_MD5_DIGEST_LENGTH)
    default:
      throw CryptoNativeModule.CryptoError.unsupportedAlgorithm("Unsupported HMAC algorithm: \(algorithm)")
    }

    var result = Data(count: digestLength)
    
    result.withUnsafeMutableBytes { resultBytes in
      self.withUnsafeBytes { dataBytes in
        key.withUnsafeBytes { keyBytes in
          CCHmac(
            alg,
            keyBytes.baseAddress,
            key.count,
            dataBytes.baseAddress,
            self.count,
            resultBytes.baseAddress
          )
        }
      }
    }

    return result
  }
}
