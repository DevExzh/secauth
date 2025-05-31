import Foundation
import CommonCrypto

public class OtpGenerator {
    
    // Base32 alphabet
    private static let base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    
    // Steam Guard alphabet
    private static let steamAlphabet = "23456789BCDFGHJKMNPQRTVWXY"
    
    // MARK: - OTP Generation Functions
    
    public static func generateTOTP(secret: String, timeSlot: UInt64, digits: Int, algorithm: String) -> String {
        return generateHOTP(secret: secret, counter: timeSlot, digits: digits, algorithm: algorithm)
    }
    
    public static func generateHOTP(secret: String, counter: UInt64, digits: Int, algorithm: String) -> String {
        guard let key = base32DecodeToData(input: secret) else {
            return ""
        }
        
        // Convert counter to big-endian bytes
        var counterBytes = Data(count: 8)
        counterBytes.withUnsafeMutableBytes { bytes in
            let buffer = bytes.bindMemory(to: UInt64.self)
            buffer[0] = counter.bigEndian
        }
        
        // Calculate HMAC
        guard let hash = hmacSHA1(key: key, data: counterBytes) else {
            return ""
        }
        
        // Dynamic truncation
        let offset = Int(hash[hash.count - 1] & 0x0F)
        let code = (UInt32(hash[offset] & 0x7F) << 24) |
                  (UInt32(hash[offset + 1]) << 16) |
                  (UInt32(hash[offset + 2]) << 8) |
                  UInt32(hash[offset + 3])
        
        // Generate the final code
        let modulus = UInt32(pow(10.0, Double(digits)))
        let finalCode = code % modulus
        
        // Format with leading zeros
        return String(format: "%0\(digits)d", finalCode)
    }
    
    public static func generateMOTP(secret: String, pin: String, timeSlot: UInt64) -> String {
        return generateMOTPWithPeriod(secret: secret, pin: pin, timeSlot: timeSlot, period: 10)
    }
    
    public static func generateMOTPWithPeriod(secret: String, pin: String, timeSlot: UInt64, period: Int) -> String {
        // Calculate time period
        let timePeriod = timeSlot / UInt64(period)
        
        // Create input string: secret + pin + time_period
        let input = secret + pin + String(timePeriod)
        
        // Calculate MD5 hash
        guard let hash = md5Hash(input: input) else {
            return ""
        }
        
        // Take first 6 characters as hex
        let hexString = hash.prefix(3).map { String(format: "%02x", $0) }.joined()
        return String(hexString.prefix(6))
    }
    
    public static func generateSteamGuard(secret: String, timeSlot: UInt64) -> String {
        guard let key = base32DecodeToData(input: secret) else {
            return ""
        }
        
        // Convert time slot to big-endian bytes
        var timeBytes = Data(count: 8)
        timeBytes.withUnsafeMutableBytes { bytes in
            let buffer = bytes.bindMemory(to: UInt64.self)
            buffer[0] = timeSlot.bigEndian
        }
        
        // Calculate HMAC
        guard let hash = hmacSHA1(key: key, data: timeBytes) else {
            return ""
        }
        
        // Steam Guard uses a different alphabet and 5 characters
        var code = ""
        for i in 0..<5 {
            let index = Int(hash[i]) % steamAlphabet.count
            let char = steamAlphabet[steamAlphabet.index(steamAlphabet.startIndex, offsetBy: index)]
            code.append(char)
        }
        
        return code
    }
    
    // MARK: - Utility Functions
    
    public static func validateSecret(secret: String) -> Bool {
        if secret.isEmpty {
            return false
        }
        
        // Check if all characters are valid Base32
        let validChars = CharacterSet(charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=")
        return secret.uppercased().unicodeScalars.allSatisfy { validChars.contains($0) }
    }
    
    public static func base32Decode(input: String) -> Data {
        return base32DecodeToData(input: input) ?? Data()
    }
    
    public static func base32Encode(data: Data) -> String {
        if data.isEmpty {
            return ""
        }
        
        var result = ""
        var buffer: UInt64 = 0
        var bitsLeft = 0
        
        for byte in data {
            buffer = (buffer << 8) | UInt64(byte)
            bitsLeft += 8
            
            while bitsLeft >= 5 {
                let index = Int((buffer >> (bitsLeft - 5)) & 0x1F)
                result.append(base32Alphabet[base32Alphabet.index(base32Alphabet.startIndex, offsetBy: index)])
                bitsLeft -= 5
            }
        }
        
        if bitsLeft > 0 {
            let index = Int((buffer << (5 - bitsLeft)) & 0x1F)
            result.append(base32Alphabet[base32Alphabet.index(base32Alphabet.startIndex, offsetBy: index)])
        }
        
        // Add padding
        while result.count % 8 != 0 {
            result.append("=")
        }
        
        return result
    }
    
    // MARK: - Private Helper Functions
    
    private static func base32DecodeToData(input: String) -> Data? {
        if input.isEmpty {
            return nil
        }
        
        let cleanInput = input.uppercased().replacingOccurrences(of: "=", with: "")
        if cleanInput.isEmpty {
            return nil
        }
        
        var result = Data()
        var buffer: UInt64 = 0
        var bitsLeft = 0
        
        for char in cleanInput {
            guard let index = base32Alphabet.firstIndex(of: char) else {
                return nil
            }
            
            let value = base32Alphabet.distance(from: base32Alphabet.startIndex, to: index)
            buffer = (buffer << 5) | UInt64(value)
            bitsLeft += 5
            
            if bitsLeft >= 8 {
                result.append(UInt8((buffer >> (bitsLeft - 8)) & 0xFF))
                bitsLeft -= 8
            }
        }
        
        return result
    }
    
    private static func hmacSHA1(key: Data, data: Data) -> Data? {
        var result = Data(count: Int(CC_SHA1_DIGEST_LENGTH))
        
        result.withUnsafeMutableBytes { resultBytes in
            key.withUnsafeBytes { keyBytes in
                data.withUnsafeBytes { dataBytes in
                    CCHmac(CCHmacAlgorithm(kCCHmacAlgSHA1),
                          keyBytes.baseAddress, key.count,
                          dataBytes.baseAddress, data.count,
                          resultBytes.baseAddress)
                }
            }
        }
        
        return result
    }
    
    private static func md5Hash(input: String) -> Data? {
        guard let data = input.data(using: .utf8) else {
            return nil
        }
        
        var result = Data(count: Int(CC_MD5_DIGEST_LENGTH))
        
        result.withUnsafeMutableBytes { resultBytes in
            data.withUnsafeBytes { dataBytes in
                CC_MD5(dataBytes.baseAddress, CC_LONG(data.count), resultBytes.bindMemory(to: UInt8.self).baseAddress)
            }
        }
        
        return result
    }
} 