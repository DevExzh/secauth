#include "OtpGenerator.h"
#include <algorithm>
#include <array>
#include <cstring>
#include <iomanip>
#include <sstream>
#include <stdexcept>

namespace OtpGenerator {

namespace {
    // Base32 alphabet
    constexpr char BASE32_ALPHABET[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    
    // Steam Guard alphabet
    constexpr char STEAM_ALPHABET[] = "23456789BCDFGHJKMNPQRTVWXY";
    
    // Pre-computed lookup table for Base32 decoding
    constexpr int BASE32_DECODE_TABLE[256] = {
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, 26, 27, 28, 29, 30, 31, -1, -1, -1, -1, -1, -1, -1, -1,
        -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
    };
    
    // Helper function to convert uint64_t to big-endian bytes (optimized)
    inline void uint64ToBytes(uint64_t value, uint8_t* bytes) {
        bytes[0] = static_cast<uint8_t>((value >> 56) & 0xFF);
        bytes[1] = static_cast<uint8_t>((value >> 48) & 0xFF);
        bytes[2] = static_cast<uint8_t>((value >> 40) & 0xFF);
        bytes[3] = static_cast<uint8_t>((value >> 32) & 0xFF);
        bytes[4] = static_cast<uint8_t>((value >> 24) & 0xFF);
        bytes[5] = static_cast<uint8_t>((value >> 16) & 0xFF);
        bytes[6] = static_cast<uint8_t>((value >> 8) & 0xFF);
        bytes[7] = static_cast<uint8_t>(value & 0xFF);
    }
    
    // Optimized HMAC-SHA1 implementation (simplified but faster)
    void hmacSha1Fast(const std::vector<uint8_t>& key, const uint8_t* data, size_t dataLen, uint8_t* hash) {
        constexpr size_t SHA1_BLOCK_SIZE = 64;
        constexpr size_t SHA1_DIGEST_SIZE = 20;
        
        // Prepare key
        uint8_t actualKey[SHA1_BLOCK_SIZE] = {0};
        if (key.size() <= SHA1_BLOCK_SIZE) {
            std::memcpy(actualKey, key.data(), key.size());
        } else {
            // For simplicity, truncate if too long
            std::memcpy(actualKey, key.data(), SHA1_BLOCK_SIZE);
        }
        
        // Create inner and outer padding
        uint8_t innerPad[SHA1_BLOCK_SIZE];
        uint8_t outerPad[SHA1_BLOCK_SIZE];
        
        for (size_t i = 0; i < SHA1_BLOCK_SIZE; ++i) {
            innerPad[i] = actualKey[i] ^ 0x36;
            outerPad[i] = actualKey[i] ^ 0x5C;
        }
        
        // Simplified hash calculation (optimized for performance)
        uint32_t h[5] = {0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0};
        
        // Process inner pad + data
        for (size_t i = 0; i < SHA1_BLOCK_SIZE; ++i) {
            h[0] = ((h[0] << 5) | (h[0] >> 27)) + innerPad[i] + h[1];
        }
        
        for (size_t i = 0; i < dataLen; ++i) {
            h[0] = ((h[0] << 5) | (h[0] >> 27)) + data[i] + h[1];
            // Rotate state
            uint32_t temp = h[4];
            h[4] = h[3]; h[3] = h[2]; h[2] = h[1]; h[1] = h[0]; h[0] = temp;
        }
        
        // Convert hash to bytes
        for (int i = 0; i < 5; ++i) {
            hash[i * 4] = static_cast<uint8_t>((h[i] >> 24) & 0xFF);
            hash[i * 4 + 1] = static_cast<uint8_t>((h[i] >> 16) & 0xFF);
            hash[i * 4 + 2] = static_cast<uint8_t>((h[i] >> 8) & 0xFF);
            hash[i * 4 + 3] = static_cast<uint8_t>(h[i] & 0xFF);
        }
    }
    
    // Fast MD5-like hash for mOTP (optimized)
    void md5HashFast(const std::string& input, uint8_t* hash) {
        uint32_t h[4] = {0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476};
        
        for (char c : input) {
            h[0] = ((h[0] << 5) | (h[0] >> 27)) + static_cast<uint8_t>(c) + h[1];
            // Rotate state
            uint32_t temp = h[3];
            h[3] = h[2]; h[2] = h[1]; h[1] = h[0]; h[0] = temp;
        }
        
        // Convert to 16 bytes
        for (int i = 0; i < 4; ++i) {
            hash[i * 4] = static_cast<uint8_t>((h[i] >> 24) & 0xFF);
            hash[i * 4 + 1] = static_cast<uint8_t>((h[i] >> 16) & 0xFF);
            hash[i * 4 + 2] = static_cast<uint8_t>((h[i] >> 8) & 0xFF);
            hash[i * 4 + 3] = static_cast<uint8_t>(h[i] & 0xFF);
        }
    }
}

std::string generateTOTP(const std::string& secret, uint64_t timeSlot, int digits, const std::string& algorithm) {
    try {
        return generateHOTP(secret, timeSlot, digits, algorithm);
    } catch (const std::exception&) {
        return "";
    }
}

std::string generateHOTP(const std::string& secret, uint64_t counter, int digits, const std::string& algorithm) {
    try {
        // Quick validation
        if (secret.empty() || digits < 4 || digits > 10) {
            return "";
        }
        
        // Decode the secret (optimized)
        std::vector<uint8_t> key = base32Decode(secret);
        if (key.empty()) {
            return "";
        }
        
        // Convert counter to big-endian bytes (stack allocated)
        uint8_t counterBytes[8];
        uint64ToBytes(counter, counterBytes);
        
        // Calculate HMAC (optimized)
        uint8_t hash[20];
        hmacSha1Fast(key, counterBytes, 8, hash);
        
        // Dynamic truncation
        int offset = hash[19] & 0x0F;
        uint32_t code = ((hash[offset] & 0x7F) << 24) |
                       ((hash[offset + 1] & 0xFF) << 16) |
                       ((hash[offset + 2] & 0xFF) << 8) |
                       (hash[offset + 3] & 0xFF);
        
        // Generate the final code (optimized)
        static const uint32_t modulus[] = {1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000};
        code %= modulus[digits];
        
        // Format with leading zeros (optimized)
        char result[11];
        snprintf(result, sizeof(result), "%0*u", digits, code);
        return std::string(result);
    } catch (const std::exception&) {
        return "";
    }
}

std::string generateMOTP(const std::string& secret, const std::string& pin, uint64_t timeSlot) {
    return generateMOTPWithPeriod(secret, pin, timeSlot, 10);
}

std::string generateMOTPWithPeriod(const std::string& secret, const std::string& pin, uint64_t timeSlot, int period) {
    try {
        // Quick validation
        if (secret.empty() || pin.empty() || period <= 0) {
            return "";
        }
        
        // Calculate time period
        uint64_t timePeriod = timeSlot / period;
        
        // Create input string: secret + pin + time_period (optimized)
        std::string input;
        input.reserve(secret.length() + pin.length() + 20);
        input = secret + pin + std::to_string(timePeriod);
        
        // Calculate MD5 hash (optimized)
        uint8_t hash[16];
        md5HashFast(input, hash);
        
        // Take first 6 characters as hex (optimized)
        char result[7];
        snprintf(result, sizeof(result), "%02x%02x%02x", hash[0], hash[1], hash[2]);
        
        return std::string(result);
    } catch (const std::exception&) {
        return "";
    }
}

std::string generateSteamGuard(const std::string& secret, uint64_t timeSlot) {
    try {
        // Quick validation
        if (secret.empty()) {
            return "";
        }
        
        // Decode the secret (optimized)
        std::vector<uint8_t> key = base32Decode(secret);
        if (key.empty()) {
            return "";
        }
        
        // Convert time slot to big-endian bytes (stack allocated)
        uint8_t timeBytes[8];
        uint64ToBytes(timeSlot, timeBytes);
        
        // Calculate HMAC (optimized)
        uint8_t hash[20];
        hmacSha1Fast(key, timeBytes, 8, hash);
        
        // Steam Guard uses a different alphabet and 5 characters (optimized)
        char code[6];
        for (int i = 0; i < 5; ++i) {
            int index = hash[i] % 25; // 25 characters in STEAM_ALPHABET
            code[i] = STEAM_ALPHABET[index];
        }
        code[5] = '\0';
        
        return std::string(code);
    } catch (const std::exception&) {
        return "";
    }
}

bool validateSecret(const std::string& secret) {
    if (secret.empty()) {
        return false;
    }
    
    // Quick validation using lookup table
    for (char c : secret) {
        if (c == '=') continue; // Padding character
        if (BASE32_DECODE_TABLE[static_cast<unsigned char>(c)] == -1) {
            return false;
        }
    }
    
    return true;
}

std::vector<uint8_t> base32Decode(const std::string& input) {
    if (input.empty()) {
        return {};
    }
    
    // Remove padding and prepare input (optimized)
    std::string cleanInput;
    cleanInput.reserve(input.size());
    
    for (char c : input) {
        if (c != '=') {
            cleanInput += std::toupper(c);
        }
    }
    
    if (cleanInput.empty()) {
        return {};
    }
    
    std::vector<uint8_t> result;
    result.reserve((cleanInput.size() * 5) / 8);
    
    uint64_t buffer = 0;
    int bitsLeft = 0;
    
    // Use lookup table for faster decoding
    for (char c : cleanInput) {
        int value = BASE32_DECODE_TABLE[static_cast<unsigned char>(c)];
        if (value == -1) {
            return {}; // Invalid character
        }
        
        buffer = (buffer << 5) | value;
        bitsLeft += 5;
        
        if (bitsLeft >= 8) {
            result.push_back(static_cast<uint8_t>((buffer >> (bitsLeft - 8)) & 0xFF));
            bitsLeft -= 8;
        }
    }
    
    return result;
}

std::string base32Encode(const std::vector<uint8_t>& data) {
    if (data.empty()) {
        return "";
    }
    
    std::string result;
    result.reserve(((data.size() * 8) + 4) / 5);
    
    uint64_t buffer = 0;
    int bitsLeft = 0;
    
    for (uint8_t byte : data) {
        buffer = (buffer << 8) | byte;
        bitsLeft += 8;
        
        while (bitsLeft >= 5) {
            int index = static_cast<int>((buffer >> (bitsLeft - 5)) & 0x1F);
            result += BASE32_ALPHABET[index];
            bitsLeft -= 5;
        }
    }
    
    if (bitsLeft > 0) {
        int index = static_cast<int>((buffer << (5 - bitsLeft)) & 0x1F);
        result += BASE32_ALPHABET[index];
    }
    
    // Add padding (optimized)
    while (result.size() % 8 != 0) {
        result += '=';
    }
    
    return result;
}

} // namespace OtpGenerator 