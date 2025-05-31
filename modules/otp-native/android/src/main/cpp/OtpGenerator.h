#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace OtpGenerator {
    /**
     * Generate TOTP (Time-based One-Time Password) code
     * @param secret Base32 encoded secret
     * @param timeSlot Current time slot (seconds since epoch / period)
     * @param digits Number of digits in the output code
     * @param algorithm Hash algorithm (SHA1, SHA256, SHA512)
     * @return Generated OTP code
     */
    std::string generateTOTP(const std::string& secret, uint64_t timeSlot, int digits, const std::string& algorithm);
    
    /**
     * Generate HOTP (HMAC-based One-Time Password) code
     * @param secret Base32 encoded secret
     * @param counter Counter value
     * @param digits Number of digits in the output code
     * @param algorithm Hash algorithm (SHA1, SHA256, SHA512)
     * @return Generated OTP code
     */
    std::string generateHOTP(const std::string& secret, uint64_t counter, int digits, const std::string& algorithm);
    
    /**
     * Generate mOTP (Mobile One-Time Password) code
     * @param secret Secret key
     * @param pin PIN code
     * @param timeSlot Current time slot
     * @return Generated mOTP code (6 character hex)
     */
    std::string generateMOTP(const std::string& secret, const std::string& pin, uint64_t timeSlot);
    
    /**
     * Generate mOTP with custom period
     * @param secret Secret key
     * @param pin PIN code
     * @param timeSlot Current time slot
     * @param period Time period in seconds
     * @return Generated mOTP code (6 character hex)
     */
    std::string generateMOTPWithPeriod(const std::string& secret, const std::string& pin, uint64_t timeSlot, int period);
    
    /**
     * Generate Steam Guard code
     * @param secret Base32 encoded secret
     * @param timeSlot Current time slot
     * @return Generated Steam code (5 character alphanumeric)
     */
    std::string generateSteamGuard(const std::string& secret, uint64_t timeSlot);
    
    /**
     * Validate if a secret is properly formatted Base32
     * @param secret Secret to validate
     * @return True if valid Base32, false otherwise
     */
    bool validateSecret(const std::string& secret);
    
    /**
     * Decode Base32 string to byte array
     * @param input Base32 encoded string
     * @return Decoded byte vector
     */
    std::vector<uint8_t> base32Decode(const std::string& input);
    
    /**
     * Encode byte array to Base32 string
     * @param data Byte vector to encode
     * @return Base32 encoded string
     */
    std::string base32Encode(const std::vector<uint8_t>& data);
} 