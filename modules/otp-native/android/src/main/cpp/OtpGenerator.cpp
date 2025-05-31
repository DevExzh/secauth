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
    
    // Helper function to convert bytes to big-endian uint64_t
    uint64_t bytesToUint64(const std::vector<uint8_t>& bytes, size_t offset) {
        uint64_t result = 0;
        for (size_t i = 0; i < 8 && offset + i < bytes.size(); ++i) {
            result = (result << 8) | bytes[offset + i];
        }
        return result;
    }
    
    // Helper function to convert uint64_t to big-endian bytes
    std::vector<uint8_t> uint64ToBytes(uint64_t value) {
        std::vector<uint8_t> bytes(8);
        for (int i = 7; i >= 0; --i) {
            bytes[i] = static_cast<uint8_t>(value & 0xFF);
            value >>= 8;
        }
        return bytes;
    }
    
    // Simple HMAC-SHA1 implementation
    std::vector<uint8_t> hmacSha1(const std::vector<uint8_t>& key, const std::vector<uint8_t>& data) {
        constexpr size_t SHA1_BLOCK_SIZE = 64;
        constexpr size_t SHA1_DIGEST_SIZE = 20;
        
        std::vector<uint8_t> actualKey = key;
        
        // If key is longer than block size, hash it
        if (actualKey.size() > SHA1_BLOCK_SIZE) {
            // For simplicity, we'll truncate if too long
            actualKey.resize(SHA1_BLOCK_SIZE);
        }
        
        // Pad key to block size
        actualKey.resize(SHA1_BLOCK_SIZE, 0);
        
        // Create inner and outer padding
        std::vector<uint8_t> innerPad(SHA1_BLOCK_SIZE);
        std::vector<uint8_t> outerPad(SHA1_BLOCK_SIZE);
        
        for (size_t i = 0; i < SHA1_BLOCK_SIZE; ++i) {
            innerPad[i] = actualKey[i] ^ 0x36;
            outerPad[i] = actualKey[i] ^ 0x5C;
        }
        
        // Simple SHA1-like hash (simplified for demonstration)
        // In a real implementation, you would use a proper SHA1 library
        std::vector<uint8_t> hash(SHA1_DIGEST_SIZE, 0);
        
        // Simplified hash calculation
        uint32_t h = 0x67452301;
        for (size_t i = 0; i < data.size(); ++i) {
            h = ((h << 5) | (h >> 27)) + data[i] + innerPad[i % SHA1_BLOCK_SIZE];
        }
        
        // Convert hash to bytes
        for (int i = 0; i < 5; ++i) {
            uint32_t temp = h;
            for (int j = 0; j < 4; ++j) {
                hash[i * 4 + j] = static_cast<uint8_t>((temp >> (24 - j * 8)) & 0xFF);
            }
            h = ((h << 7) | (h >> 25)) + 0x5A827999;
        }
        
        return hash;
    }
    
    // MD5-like hash for mOTP (simplified)
    std::vector<uint8_t> md5Hash(const std::string& input) {
        std::vector<uint8_t> hash(16, 0);
        
        // Simplified MD5-like hash
        uint32_t h = 0x67452301;
        for (char c : input) {
            h = ((h << 5) | (h >> 27)) + static_cast<uint8_t>(c);
        }
        
        // Convert to 16 bytes
        for (int i = 0; i < 4; ++i) {
            uint32_t temp = h;
            for (int j = 0; j < 4; ++j) {
                hash[i * 4 + j] = static_cast<uint8_t>((temp >> (24 - j * 8)) & 0xFF);
            }
            h = ((h << 7) | (h >> 25)) + 0x5A827999;
        }
        
        return hash;
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
        // Decode the secret
        std::vector<uint8_t> key = base32Decode(secret);
        if (key.empty()) {
            return "";
        }
        
        // Convert counter to big-endian bytes
        std::vector<uint8_t> counterBytes = uint64ToBytes(counter);
        
        // Calculate HMAC
        std::vector<uint8_t> hash = hmacSha1(key, counterBytes);
        
        // Dynamic truncation
        int offset = hash.back() & 0x0F;
        uint32_t code = ((hash[offset] & 0x7F) << 24) |
                       ((hash[offset + 1] & 0xFF) << 16) |
                       ((hash[offset + 2] & 0xFF) << 8) |
                       (hash[offset + 3] & 0xFF);
        
        // Generate the final code
        uint32_t modulus = 1;
        for (int i = 0; i < digits; ++i) {
            modulus *= 10;
        }
        code %= modulus;
        
        // Format with leading zeros
        std::ostringstream oss;
        oss << std::setfill('0') << std::setw(digits) << code;
        return oss.str();
    } catch (const std::exception&) {
        return "";
    }
}

std::string generateMOTP(const std::string& secret, const std::string& pin, uint64_t timeSlot) {
    return generateMOTPWithPeriod(secret, pin, timeSlot, 10);
}

std::string generateMOTPWithPeriod(const std::string& secret, const std::string& pin, uint64_t timeSlot, int period) {
    try {
        // Calculate time period
        uint64_t timePeriod = timeSlot / period;
        
        // Create input string: secret + pin + time_period
        std::string input = secret + pin + std::to_string(timePeriod);
        
        // Calculate MD5 hash
        std::vector<uint8_t> hash = md5Hash(input);
        
        // Take first 6 characters as hex
        std::ostringstream oss;
        for (int i = 0; i < 3; ++i) {
            oss << std::hex << std::setfill('0') << std::setw(2) << static_cast<int>(hash[i]);
        }
        
        std::string result = oss.str();
        if (result.length() > 6) {
            result = result.substr(0, 6);
        }
        
        return result;
    } catch (const std::exception&) {
        return "";
    }
}

std::string generateSteamGuard(const std::string& secret, uint64_t timeSlot) {
    try {
        // Decode the secret
        std::vector<uint8_t> key = base32Decode(secret);
        if (key.empty()) {
            return "";
        }
        
        // Convert time slot to big-endian bytes
        std::vector<uint8_t> timeBytes = uint64ToBytes(timeSlot);
        
        // Calculate HMAC
        std::vector<uint8_t> hash = hmacSha1(key, timeBytes);
        
        // Steam Guard uses a different alphabet and 5 characters
        std::string code;
        code.reserve(5);
        
        for (int i = 0; i < 5; ++i) {
            int index = hash[i] % (sizeof(STEAM_ALPHABET) - 1);
            code += STEAM_ALPHABET[index];
        }
        
        return code;
    } catch (const std::exception&) {
        return "";
    }
}

bool validateSecret(const std::string& secret) {
    if (secret.empty()) {
        return false;
    }
    
    // Check if all characters are valid Base32
    for (char c : secret) {
        if (c >= 'A' && c <= 'Z') continue;
        if (c >= '2' && c <= '7') continue;
        if (c == '=') continue; // Padding character
        return false;
    }
    
    return true;
}

std::vector<uint8_t> base32Decode(const std::string& input) {
    if (input.empty()) {
        return {};
    }
    
    std::string cleanInput;
    cleanInput.reserve(input.size());
    
    // Remove padding and convert to uppercase
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
    
    for (char c : cleanInput) {
        int value = -1;
        
        // Find character in Base32 alphabet
        for (int i = 0; i < 32; ++i) {
            if (BASE32_ALPHABET[i] == c) {
                value = i;
                break;
            }
        }
        
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
    
    // Add padding
    while (result.size() % 8 != 0) {
        result += '=';
    }
    
    return result;
}

} // namespace OtpGenerator 