#pragma once

#include <string>
#include <vector>
#include <memory>
#include <stdexcept>

namespace crypto_native {

// Enumerations
enum class CipherAlgorithm {
    AES_128_CBC,
    AES_192_CBC,
    AES_256_CBC,
    AES_128_GCM,
    AES_192_GCM,
    AES_256_GCM,
    AES_128_CTR,
    AES_192_CTR,
    AES_256_CTR,
    CHACHA20,
    CHACHA20_POLY1305
};

enum class PaddingMode {
    PKCS7,
    PKCS5,
    ISO10126,
    ANSIX923,
    ZERO,
    NONE
};

enum class HashAlgorithm {
    SHA1,
    SHA256,
    SHA384,
    SHA512,
    MD5
};

enum class KeyDerivationFunction {
    PBKDF2,
    SCRYPT,
    ARGON2
};

// Exception classes
class CryptoException : public std::runtime_error {
public:
    explicit CryptoException(const std::string& message) : std::runtime_error(message) {}
};

class InvalidKeyException : public CryptoException {
public:
    explicit InvalidKeyException(const std::string& message) : CryptoException("Invalid key: " + message) {}
};

class InvalidParameterException : public CryptoException {
public:
    explicit InvalidParameterException(const std::string& message) : CryptoException("Invalid parameter: " + message) {}
};

class CryptoOperationException : public CryptoException {
public:
    explicit CryptoOperationException(const std::string& message) : CryptoException("Crypto operation failed: " + message) {}
};

// Data structures
struct EncryptionResult {
    std::vector<uint8_t> ciphertext;
    std::vector<uint8_t> iv;
    std::vector<uint8_t> tag;  // For AEAD modes
    
    EncryptionResult() = default;
    EncryptionResult(std::vector<uint8_t> ct, std::vector<uint8_t> iv_data)
        : ciphertext(std::move(ct)), iv(std::move(iv_data)) {}
    EncryptionResult(std::vector<uint8_t> ct, std::vector<uint8_t> iv_data, std::vector<uint8_t> tag_data)
        : ciphertext(std::move(ct)), iv(std::move(iv_data)), tag(std::move(tag_data)) {}
};

struct KeyDerivationOptions {
    KeyDerivationFunction kdf = KeyDerivationFunction::PBKDF2;
    uint32_t iterations = 100000;
    uint32_t saltLength = 32;
    uint32_t keyLength = 32;
    uint32_t memory = 0;       // For Argon2 (in KB)
    uint32_t parallelism = 1;  // For Argon2
};

struct DerivedKey {
    std::vector<uint8_t> key;
    std::vector<uint8_t> salt;
};

// Core cryptographic engine
class CryptoEngine {
public:
    CryptoEngine();
    ~CryptoEngine();

    // Disable copy constructor and assignment operator for security
    CryptoEngine(const CryptoEngine&) = delete;
    CryptoEngine& operator=(const CryptoEngine&) = delete;

    // Move constructor and assignment operator
    CryptoEngine(CryptoEngine&&) noexcept = default;
    CryptoEngine& operator=(CryptoEngine&&) noexcept = default;

    // Core encryption/decryption
    EncryptionResult encrypt(
        const std::vector<uint8_t>& data,
        const std::vector<uint8_t>& key,
        CipherAlgorithm algorithm,
        PaddingMode padding = PaddingMode::PKCS7,
        const std::vector<uint8_t>& iv = {},
        const std::vector<uint8_t>& aad = {}
    );

    std::vector<uint8_t> decrypt(
        const std::vector<uint8_t>& ciphertext,
        const std::vector<uint8_t>& key,
        CipherAlgorithm algorithm,
        const std::vector<uint8_t>& iv,
        PaddingMode padding = PaddingMode::PKCS7,
        const std::vector<uint8_t>& aad = {},
        const std::vector<uint8_t>& tag = {}
    );

    // Key management
    std::vector<uint8_t> generateKey(size_t length);
    
    DerivedKey deriveKey(
        const std::string& password,
        const KeyDerivationOptions& options
    );
    
    std::vector<uint8_t> deriveKeyWithSalt(
        const std::string& password,
        const std::vector<uint8_t>& salt,
        const KeyDerivationOptions& options
    );

    // Hashing
    std::vector<uint8_t> hash(
        const std::vector<uint8_t>& data,
        HashAlgorithm algorithm
    );

    std::vector<uint8_t> hmac(
        const std::vector<uint8_t>& data,
        const std::vector<uint8_t>& key,
        HashAlgorithm algorithm
    );

    // Random number generation
    std::vector<uint8_t> randomBytes(size_t length);
    uint32_t randomInt(uint32_t min, uint32_t max);

    // Utility functions
    static std::string encodeBase64(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> decodeBase64(const std::string& data);
    static std::string encodeHex(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> decodeHex(const std::string& data);

    // Security utilities
    static bool secureCompare(const std::vector<uint8_t>& a, const std::vector<uint8_t>& b);
    static void secureZero(std::vector<uint8_t>& data);
    static void secureZero(void* ptr, size_t size);

private:
    class Impl;
    std::unique_ptr<Impl> pImpl;

    // Internal helper functions
    static size_t getKeySize(CipherAlgorithm algorithm);
    static size_t getBlockSize(CipherAlgorithm algorithm);
    static size_t getIvSize(CipherAlgorithm algorithm);
    static bool isAeadMode(CipherAlgorithm algorithm);
    static bool isStreamCipher(CipherAlgorithm algorithm);
    
    // Padding functions
    std::vector<uint8_t> addPadding(
        const std::vector<uint8_t>& data,
        PaddingMode mode,
        size_t blockSize
    );
    
    std::vector<uint8_t> removePadding(
        const std::vector<uint8_t>& data,
        PaddingMode mode,
        size_t blockSize
    );

    // Algorithm-specific implementations
    EncryptionResult encryptAES(
        const std::vector<uint8_t>& data,
        const std::vector<uint8_t>& key,
        CipherAlgorithm algorithm,
        PaddingMode padding,
        const std::vector<uint8_t>& iv,
        const std::vector<uint8_t>& aad
    );

    std::vector<uint8_t> decryptAES(
        const std::vector<uint8_t>& ciphertext,
        const std::vector<uint8_t>& key,
        CipherAlgorithm algorithm,
        const std::vector<uint8_t>& iv,
        PaddingMode padding,
        const std::vector<uint8_t>& aad,
        const std::vector<uint8_t>& tag
    );

    EncryptionResult encryptChaCha20(
        const std::vector<uint8_t>& data,
        const std::vector<uint8_t>& key,
        CipherAlgorithm algorithm,
        const std::vector<uint8_t>& iv,
        const std::vector<uint8_t>& aad
    );

    std::vector<uint8_t> decryptChaCha20(
        const std::vector<uint8_t>& ciphertext,
        const std::vector<uint8_t>& key,
        CipherAlgorithm algorithm,
        const std::vector<uint8_t>& iv,
        const std::vector<uint8_t>& aad,
        const std::vector<uint8_t>& tag
    );

    // Key derivation implementations
    std::vector<uint8_t> pbkdf2(
        const std::string& password,
        const std::vector<uint8_t>& salt,
        uint32_t iterations,
        uint32_t keyLength,
        HashAlgorithm hashAlg
    );

    std::vector<uint8_t> scrypt(
        const std::string& password,
        const std::vector<uint8_t>& salt,
        uint32_t N,
        uint32_t r,
        uint32_t p,
        uint32_t keyLength
    );

    std::vector<uint8_t> argon2(
        const std::string& password,
        const std::vector<uint8_t>& salt,
        uint32_t iterations,
        uint32_t memory,
        uint32_t parallelism,
        uint32_t keyLength
    );
};

// RAII wrapper for secure memory management
class SecureBuffer {
public:
    explicit SecureBuffer(size_t size);
    ~SecureBuffer();
    
    // Disable copy
    SecureBuffer(const SecureBuffer&) = delete;
    SecureBuffer& operator=(const SecureBuffer&) = delete;
    
    // Enable move
    SecureBuffer(SecureBuffer&& other) noexcept;
    SecureBuffer& operator=(SecureBuffer&& other) noexcept;
    
    uint8_t* data() { return data_; }
    const uint8_t* data() const { return data_; }
    size_t size() const { return size_; }
    
    // Secure zero and resize
    void clear();
    void resize(size_t newSize);

private:
    uint8_t* data_;
    size_t size_;
    
    void allocate(size_t size);
    void deallocate();
};

} // namespace crypto_native 