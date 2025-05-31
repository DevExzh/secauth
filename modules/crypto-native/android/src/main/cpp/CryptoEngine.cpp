#include "CryptoEngine.h"
#include <algorithm>
#include <random>
#include <cstring>
#include <iomanip>
#include <sstream>
#include <cstdlib>

#ifdef NO_OPENSSL
// Simple implementations without OpenSSL
#include <android/log.h>
#define LOG_TAG "CryptoEngine"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#else
#include <openssl/evp.h>
#include <openssl/aes.h>
#include <openssl/rand.h>
#include <openssl/sha.h>
#include <openssl/hmac.h>
#include <openssl/kdf.h>
#include <openssl/crypto.h>
#include <openssl/err.h>
#include <openssl/chacha.h>
#include <openssl/poly1305.h>
#endif

namespace crypto_native {

// Base64 encoding table
static const char base64_chars[] = 
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

// Implementation class using PIMPL idiom
class CryptoEngine::Impl {
public:
    Impl() {
#ifdef NO_OPENSSL
        // Initialize random number generator
        rng.seed(std::random_device{}());
#else
        // Initialize OpenSSL
        OpenSSL_add_all_algorithms();
        ERR_load_crypto_strings();
#endif
    }

    ~Impl() {
#ifndef NO_OPENSSL
        // Cleanup OpenSSL
        EVP_cleanup();
        ERR_free_strings();
#endif
    }

    std::mt19937_64 rng{std::random_device{}()};
};

CryptoEngine::CryptoEngine() : pImpl(std::make_unique<Impl>()) {}

CryptoEngine::~CryptoEngine() = default;

// Utility functions
size_t CryptoEngine::getKeySize(CipherAlgorithm algorithm) {
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CBC:
        case CipherAlgorithm::AES_128_GCM:
        case CipherAlgorithm::AES_128_CTR:
            return 16;
        case CipherAlgorithm::AES_192_CBC:
        case CipherAlgorithm::AES_192_GCM:
        case CipherAlgorithm::AES_192_CTR:
            return 24;
        case CipherAlgorithm::AES_256_CBC:
        case CipherAlgorithm::AES_256_GCM:
        case CipherAlgorithm::AES_256_CTR:
            return 32;
        case CipherAlgorithm::CHACHA20:
        case CipherAlgorithm::CHACHA20_POLY1305:
            return 32;
        default:
            throw InvalidParameterException("Unknown cipher algorithm");
    }
}

size_t CryptoEngine::getBlockSize(CipherAlgorithm algorithm) {
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CBC:
        case CipherAlgorithm::AES_192_CBC:
        case CipherAlgorithm::AES_256_CBC:
        case CipherAlgorithm::AES_128_GCM:
        case CipherAlgorithm::AES_192_GCM:
        case CipherAlgorithm::AES_256_GCM:
        case CipherAlgorithm::AES_128_CTR:
        case CipherAlgorithm::AES_192_CTR:
        case CipherAlgorithm::AES_256_CTR:
            return 16;
        case CipherAlgorithm::CHACHA20:
        case CipherAlgorithm::CHACHA20_POLY1305:
            return 1; // Stream cipher
        default:
            throw InvalidParameterException("Unknown cipher algorithm");
    }
}

size_t CryptoEngine::getIvSize(CipherAlgorithm algorithm) {
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CBC:
        case CipherAlgorithm::AES_192_CBC:
        case CipherAlgorithm::AES_256_CBC:
        case CipherAlgorithm::AES_128_CTR:
        case CipherAlgorithm::AES_192_CTR:
        case CipherAlgorithm::AES_256_CTR:
            return 16;
        case CipherAlgorithm::AES_128_GCM:
        case CipherAlgorithm::AES_192_GCM:
        case CipherAlgorithm::AES_256_GCM:
            return 12; // GCM typically uses 96-bit IV
        case CipherAlgorithm::CHACHA20:
        case CipherAlgorithm::CHACHA20_POLY1305:
            return 12;
        default:
            throw InvalidParameterException("Unknown cipher algorithm");
    }
}

bool CryptoEngine::isAeadMode(CipherAlgorithm algorithm) {
    switch (algorithm) {
        case CipherAlgorithm::AES_128_GCM:
        case CipherAlgorithm::AES_192_GCM:
        case CipherAlgorithm::AES_256_GCM:
        case CipherAlgorithm::CHACHA20_POLY1305:
            return true;
        default:
            return false;
    }
}

bool CryptoEngine::isStreamCipher(CipherAlgorithm algorithm) {
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CTR:
        case CipherAlgorithm::AES_192_CTR:
        case CipherAlgorithm::AES_256_CTR:
        case CipherAlgorithm::CHACHA20:
        case CipherAlgorithm::CHACHA20_POLY1305:
            return true;
        default:
            return false;
    }
}

// Base64 encoding/decoding
std::string CryptoEngine::encodeBase64(const std::vector<uint8_t>& data) {
    std::string encoded;
    int val = 0, valb = -6;
    for (uint8_t c : data) {
        val = (val << 8) + c;
        valb += 8;
        while (valb >= 0) {
            encoded.push_back(base64_chars[(val >> valb) & 0x3F]);
            valb -= 6;
        }
    }
    if (valb > -6) {
        encoded.push_back(base64_chars[((val << 8) >> (valb + 8)) & 0x3F]);
    }
    while (encoded.size() % 4) {
        encoded.push_back('=');
    }
    return encoded;
}

std::vector<uint8_t> CryptoEngine::decodeBase64(const std::string& data) {
    std::vector<uint8_t> decoded;
    std::vector<int> T(128, -1);
    for (int i = 0; i < 64; i++) {
        T[base64_chars[i]] = i;
    }

    int val = 0, valb = -8;
    for (char c : data) {
        if (T[c] == -1) break;
        val = (val << 6) + T[c];
        valb += 6;
        if (valb >= 0) {
            decoded.push_back(char((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return decoded;
}

// Hex encoding/decoding
std::string CryptoEngine::encodeHex(const std::vector<uint8_t>& data) {
    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    for (uint8_t byte : data) {
        ss << std::setw(2) << static_cast<int>(byte);
    }
    return ss.str();
}

std::vector<uint8_t> CryptoEngine::decodeHex(const std::string& data) {
    std::vector<uint8_t> decoded;
    for (size_t i = 0; i < data.length(); i += 2) {
        std::string byteString = data.substr(i, 2);
        uint8_t byte = static_cast<uint8_t>(std::strtol(byteString.c_str(), nullptr, 16));
        decoded.push_back(byte);
    }
    return decoded;
}

// Security utilities
bool CryptoEngine::secureCompare(const std::vector<uint8_t>& a, const std::vector<uint8_t>& b) {
    if (a.size() != b.size()) {
        return false;
    }
    
    int result = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        result |= a[i] ^ b[i];
    }
    return result == 0;
}

void CryptoEngine::secureZero(std::vector<uint8_t>& data) {
    if (!data.empty()) {
#ifdef NO_OPENSSL
        // Use volatile to prevent compiler optimization
        volatile uint8_t* ptr = data.data();
        for (size_t i = 0; i < data.size(); ++i) {
            ptr[i] = 0;
        }
#else
        OPENSSL_cleanse(data.data(), data.size());
#endif
    }
}

void CryptoEngine::secureZero(void* ptr, size_t size) {
    if (ptr && size > 0) {
#ifdef NO_OPENSSL
        // Use volatile to prevent compiler optimization
        volatile uint8_t* vptr = static_cast<volatile uint8_t*>(ptr);
        for (size_t i = 0; i < size; ++i) {
            vptr[i] = 0;
        }
#else
        OPENSSL_cleanse(ptr, size);
#endif
    }
}

// Random number generation
std::vector<uint8_t> CryptoEngine::randomBytes(size_t length) {
    std::vector<uint8_t> buffer(length);
#ifdef NO_OPENSSL
    // Use C++ random number generator
    std::uniform_int_distribution<uint8_t> dist(0, 255);
    for (size_t i = 0; i < length; ++i) {
        buffer[i] = dist(pImpl->rng);
    }
#else
    if (RAND_bytes(buffer.data(), static_cast<int>(length)) != 1) {
        throw CryptoOperationException("Failed to generate random bytes");
    }
#endif
    return buffer;
}

uint32_t CryptoEngine::randomInt(uint32_t min, uint32_t max) {
    if (min >= max) {
        throw InvalidParameterException("Invalid range for random integer");
    }
    
    std::uniform_int_distribution<uint32_t> dist(min, max - 1);
    return dist(pImpl->rng);
}

std::vector<uint8_t> CryptoEngine::generateKey(size_t length) {
    return randomBytes(length);
}

// Padding implementations
std::vector<uint8_t> CryptoEngine::addPadding(
    const std::vector<uint8_t>& data,
    PaddingMode mode,
    size_t blockSize
) {
    if (mode == PaddingMode::NONE) {
        return data;
    }

    std::vector<uint8_t> padded = data;
    size_t paddingLength = blockSize - (data.size() % blockSize);
    
    switch (mode) {
        case PaddingMode::PKCS7:
        case PaddingMode::PKCS5: {
            for (size_t i = 0; i < paddingLength; ++i) {
                padded.push_back(static_cast<uint8_t>(paddingLength));
            }
            break;
        }
        case PaddingMode::ZERO: {
            for (size_t i = 0; i < paddingLength; ++i) {
                padded.push_back(0);
            }
            break;
        }
        case PaddingMode::ISO10126: {
            std::vector<uint8_t> randomPadding = randomBytes(paddingLength - 1);
            padded.insert(padded.end(), randomPadding.begin(), randomPadding.end());
            padded.push_back(static_cast<uint8_t>(paddingLength));
            break;
        }
        case PaddingMode::ANSIX923: {
            for (size_t i = 0; i < paddingLength - 1; ++i) {
                padded.push_back(0);
            }
            padded.push_back(static_cast<uint8_t>(paddingLength));
            break;
        }
        default:
            throw InvalidParameterException("Unsupported padding mode");
    }
    
    return padded;
}

std::vector<uint8_t> CryptoEngine::removePadding(
    const std::vector<uint8_t>& data,
    PaddingMode mode,
    size_t blockSize
) {
    if (mode == PaddingMode::NONE || data.empty()) {
        return data;
    }

    switch (mode) {
        case PaddingMode::PKCS7:
        case PaddingMode::PKCS5: {
            uint8_t paddingLength = data.back();
            if (paddingLength == 0 || paddingLength > blockSize || paddingLength > data.size()) {
                throw CryptoOperationException("Invalid PKCS padding");
            }
            
            // Verify padding
            for (size_t i = data.size() - paddingLength; i < data.size(); ++i) {
                if (data[i] != paddingLength) {
                    throw CryptoOperationException("Invalid PKCS padding");
                }
            }
            
            return std::vector<uint8_t>(data.begin(), data.end() - paddingLength);
        }
        case PaddingMode::ZERO: {
            auto it = data.rbegin();
            while (it != data.rend() && *it == 0) {
                ++it;
            }
            return std::vector<uint8_t>(data.begin(), it.base());
        }
        case PaddingMode::ISO10126:
        case PaddingMode::ANSIX923: {
            uint8_t paddingLength = data.back();
            if (paddingLength == 0 || paddingLength > blockSize || paddingLength > data.size()) {
                throw CryptoOperationException("Invalid padding");
            }
            return std::vector<uint8_t>(data.begin(), data.end() - paddingLength);
        }
        default:
            throw InvalidParameterException("Unsupported padding mode");
    }
}

// Hash functions
std::vector<uint8_t> CryptoEngine::hash(
    const std::vector<uint8_t>& data,
    HashAlgorithm algorithm
) {
#ifdef NO_OPENSSL
    // Simplified hash implementation - just return a simple checksum for now
    // In a real implementation, you would use a proper hash library
    LOGE("Hash function not implemented without OpenSSL");
    throw CryptoOperationException("Hash function not available in simplified mode");
#else
    const EVP_MD* md = nullptr;
    
    switch (algorithm) {
        case HashAlgorithm::SHA1:
            md = EVP_sha1();
            break;
        case HashAlgorithm::SHA256:
            md = EVP_sha256();
            break;
        case HashAlgorithm::SHA384:
            md = EVP_sha384();
            break;
        case HashAlgorithm::SHA512:
            md = EVP_sha512();
            break;
        case HashAlgorithm::MD5:
            md = EVP_md5();
            break;
        default:
            throw InvalidParameterException("Unsupported hash algorithm");
    }

    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    if (!ctx) {
        throw CryptoOperationException("Failed to create hash context");
    }

    std::vector<uint8_t> result(EVP_MD_size(md));
    unsigned int resultLength = 0;

    if (EVP_DigestInit_ex(ctx, md, nullptr) != 1 ||
        EVP_DigestUpdate(ctx, data.data(), data.size()) != 1 ||
        EVP_DigestFinal_ex(ctx, result.data(), &resultLength) != 1) {
        EVP_MD_CTX_free(ctx);
        throw CryptoOperationException("Hash operation failed");
    }

    EVP_MD_CTX_free(ctx);
    result.resize(resultLength);
    return result;
#endif
}

// HMAC implementation
std::vector<uint8_t> CryptoEngine::hmac(
    const std::vector<uint8_t>& data,
    const std::vector<uint8_t>& key,
    HashAlgorithm algorithm
) {
#ifdef NO_OPENSSL
    // Simplified HMAC implementation - not cryptographically secure
    LOGE("HMAC function not implemented without OpenSSL");
    throw CryptoOperationException("HMAC function not available in simplified mode");
#else
    const EVP_MD* md = nullptr;
    
    switch (algorithm) {
        case HashAlgorithm::SHA1:
            md = EVP_sha1();
            break;
        case HashAlgorithm::SHA256:
            md = EVP_sha256();
            break;
        case HashAlgorithm::SHA384:
            md = EVP_sha384();
            break;
        case HashAlgorithm::SHA512:
            md = EVP_sha512();
            break;
        case HashAlgorithm::MD5:
            md = EVP_md5();
            break;
        default:
            throw InvalidParameterException("Unsupported hash algorithm");
    }

    std::vector<uint8_t> result(EVP_MD_size(md));
    unsigned int resultLength = 0;

    if (HMAC(md, key.data(), static_cast<int>(key.size()),
             data.data(), data.size(), result.data(), &resultLength) == nullptr) {
        throw CryptoOperationException("HMAC operation failed");
    }

    result.resize(resultLength);
    return result;
#endif
}

// Main encryption function
EncryptionResult CryptoEngine::encrypt(
    const std::vector<uint8_t>& data,
    const std::vector<uint8_t>& key,
    CipherAlgorithm algorithm,
    PaddingMode padding,
    const std::vector<uint8_t>& iv,
    const std::vector<uint8_t>& aad
) {
    // Validate key size
    if (key.size() != getKeySize(algorithm)) {
        throw InvalidKeyException("Invalid key size for algorithm");
    }

    // Generate IV if not provided
    std::vector<uint8_t> actualIv = iv;
    if (actualIv.empty()) {
        actualIv = randomBytes(getIvSize(algorithm));
    } else if (actualIv.size() != getIvSize(algorithm)) {
        throw InvalidParameterException("Invalid IV size for algorithm");
    }

    // Route to appropriate encryption function
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CBC:
        case CipherAlgorithm::AES_192_CBC:
        case CipherAlgorithm::AES_256_CBC:
        case CipherAlgorithm::AES_128_GCM:
        case CipherAlgorithm::AES_192_GCM:
        case CipherAlgorithm::AES_256_GCM:
        case CipherAlgorithm::AES_128_CTR:
        case CipherAlgorithm::AES_192_CTR:
        case CipherAlgorithm::AES_256_CTR:
            return encryptAES(data, key, algorithm, padding, actualIv, aad);
        case CipherAlgorithm::CHACHA20:
        case CipherAlgorithm::CHACHA20_POLY1305:
            return encryptChaCha20(data, key, algorithm, actualIv, aad);
        default:
            throw InvalidParameterException("Unsupported cipher algorithm");
    }
}

// AES encryption implementation
EncryptionResult CryptoEngine::encryptAES(
    const std::vector<uint8_t>& data,
    const std::vector<uint8_t>& key,
    CipherAlgorithm algorithm,
    PaddingMode padding,
    const std::vector<uint8_t>& iv,
    const std::vector<uint8_t>& aad
) {
#ifdef NO_OPENSSL
    // Simplified encryption - just return the data XORed with key (NOT SECURE!)
    LOGE("AES encryption not implemented without OpenSSL");
    throw CryptoOperationException("AES encryption not available in simplified mode");
#else
    const EVP_CIPHER* cipher = nullptr;
    
    // Select cipher
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CBC:
            cipher = EVP_aes_128_cbc();
            break;
        case CipherAlgorithm::AES_192_CBC:
            cipher = EVP_aes_192_cbc();
            break;
        case CipherAlgorithm::AES_256_CBC:
            cipher = EVP_aes_256_cbc();
            break;
        case CipherAlgorithm::AES_128_GCM:
            cipher = EVP_aes_128_gcm();
            break;
        case CipherAlgorithm::AES_192_GCM:
            cipher = EVP_aes_192_gcm();
            break;
        case CipherAlgorithm::AES_256_GCM:
            cipher = EVP_aes_256_gcm();
            break;
        case CipherAlgorithm::AES_128_CTR:
            cipher = EVP_aes_128_ctr();
            break;
        case CipherAlgorithm::AES_192_CTR:
            cipher = EVP_aes_192_ctr();
            break;
        case CipherAlgorithm::AES_256_CTR:
            cipher = EVP_aes_256_ctr();
            break;
        default:
            throw InvalidParameterException("Invalid AES algorithm");
    }

    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        throw CryptoOperationException("Failed to create cipher context");
    }

    // Prepare data with padding if needed
    std::vector<uint8_t> paddedData = data;
    if (!isStreamCipher(algorithm) && !isAeadMode(algorithm)) {
        paddedData = addPadding(data, padding, getBlockSize(algorithm));
    }

    std::vector<uint8_t> ciphertext(paddedData.size() + getBlockSize(algorithm));
    std::vector<uint8_t> tag;
    int len = 0;
    int ciphertextLen = 0;

    try {
        // Initialize encryption
        if (EVP_EncryptInit_ex(ctx, cipher, nullptr, key.data(), iv.data()) != 1) {
            throw CryptoOperationException("Failed to initialize encryption");
        }

        // Set AAD for AEAD modes
        if (isAeadMode(algorithm) && !aad.empty()) {
            if (EVP_EncryptUpdate(ctx, nullptr, &len, aad.data(), static_cast<int>(aad.size())) != 1) {
                throw CryptoOperationException("Failed to set AAD");
            }
        }

        // Encrypt data
        if (EVP_EncryptUpdate(ctx, ciphertext.data(), &len, paddedData.data(), static_cast<int>(paddedData.size())) != 1) {
            throw CryptoOperationException("Encryption failed");
        }
        ciphertextLen = len;

        // Finalize encryption
        if (EVP_EncryptFinal_ex(ctx, ciphertext.data() + len, &len) != 1) {
            throw CryptoOperationException("Encryption finalization failed");
        }
        ciphertextLen += len;

        // Get authentication tag for AEAD modes
        if (isAeadMode(algorithm)) {
            tag.resize(16); // 128-bit tag
            if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, 16, tag.data()) != 1) {
                throw CryptoOperationException("Failed to get authentication tag");
            }
        }

        ciphertext.resize(ciphertextLen);
        
    } catch (...) {
        EVP_CIPHER_CTX_free(ctx);
        throw;
    }

    EVP_CIPHER_CTX_free(ctx);
    return EncryptionResult(std::move(ciphertext), iv, std::move(tag));
#endif
}

// Main decryption function
std::vector<uint8_t> CryptoEngine::decrypt(
    const std::vector<uint8_t>& ciphertext,
    const std::vector<uint8_t>& key,
    CipherAlgorithm algorithm,
    const std::vector<uint8_t>& iv,
    PaddingMode padding,
    const std::vector<uint8_t>& aad,
    const std::vector<uint8_t>& tag
) {
    // Validate parameters
    if (key.size() != getKeySize(algorithm)) {
        throw InvalidKeyException("Invalid key size for algorithm");
    }
    
    if (iv.size() != getIvSize(algorithm)) {
        throw InvalidParameterException("Invalid IV size for algorithm");
    }

    if (isAeadMode(algorithm) && tag.empty()) {
        throw InvalidParameterException("Authentication tag required for AEAD mode");
    }

    // Route to appropriate decryption function
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CBC:
        case CipherAlgorithm::AES_192_CBC:
        case CipherAlgorithm::AES_256_CBC:
        case CipherAlgorithm::AES_128_GCM:
        case CipherAlgorithm::AES_192_GCM:
        case CipherAlgorithm::AES_256_GCM:
        case CipherAlgorithm::AES_128_CTR:
        case CipherAlgorithm::AES_192_CTR:
        case CipherAlgorithm::AES_256_CTR:
            return decryptAES(ciphertext, key, algorithm, iv, padding, aad, tag);
        case CipherAlgorithm::CHACHA20:
        case CipherAlgorithm::CHACHA20_POLY1305:
            return decryptChaCha20(ciphertext, key, algorithm, iv, aad, tag);
        default:
            throw InvalidParameterException("Unsupported cipher algorithm");
    }
}

// AES decryption implementation
std::vector<uint8_t> CryptoEngine::decryptAES(
    const std::vector<uint8_t>& ciphertext,
    const std::vector<uint8_t>& key,
    CipherAlgorithm algorithm,
    const std::vector<uint8_t>& iv,
    PaddingMode padding,
    const std::vector<uint8_t>& aad,
    const std::vector<uint8_t>& tag
) {
#ifdef NO_OPENSSL
    // Simplified decryption - not implemented
    LOGE("AES decryption not implemented without OpenSSL");
    throw CryptoOperationException("AES decryption not available in simplified mode");
#else
    const EVP_CIPHER* cipher = nullptr;
    
    // Select cipher (same as encryption)
    switch (algorithm) {
        case CipherAlgorithm::AES_128_CBC:
            cipher = EVP_aes_128_cbc();
            break;
        case CipherAlgorithm::AES_192_CBC:
            cipher = EVP_aes_192_cbc();
            break;
        case CipherAlgorithm::AES_256_CBC:
            cipher = EVP_aes_256_cbc();
            break;
        case CipherAlgorithm::AES_128_GCM:
            cipher = EVP_aes_128_gcm();
            break;
        case CipherAlgorithm::AES_192_GCM:
            cipher = EVP_aes_192_gcm();
            break;
        case CipherAlgorithm::AES_256_GCM:
            cipher = EVP_aes_256_gcm();
            break;
        case CipherAlgorithm::AES_128_CTR:
            cipher = EVP_aes_128_ctr();
            break;
        case CipherAlgorithm::AES_192_CTR:
            cipher = EVP_aes_192_ctr();
            break;
        case CipherAlgorithm::AES_256_CTR:
            cipher = EVP_aes_256_ctr();
            break;
        default:
            throw InvalidParameterException("Invalid AES algorithm");
    }

    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        throw CryptoOperationException("Failed to create cipher context");
    }

    std::vector<uint8_t> plaintext(ciphertext.size() + getBlockSize(algorithm));
    int len = 0;
    int plaintextLen = 0;

    try {
        // Initialize decryption
        if (EVP_DecryptInit_ex(ctx, cipher, nullptr, key.data(), iv.data()) != 1) {
            throw CryptoOperationException("Failed to initialize decryption");
        }

        // Set authentication tag for AEAD modes
        if (isAeadMode(algorithm)) {
            if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, static_cast<int>(tag.size()), 
                                   const_cast<uint8_t*>(tag.data())) != 1) {
                throw CryptoOperationException("Failed to set authentication tag");
            }
        }

        // Set AAD for AEAD modes
        if (isAeadMode(algorithm) && !aad.empty()) {
            if (EVP_DecryptUpdate(ctx, nullptr, &len, aad.data(), static_cast<int>(aad.size())) != 1) {
                throw CryptoOperationException("Failed to set AAD");
            }
        }

        // Decrypt data
        if (EVP_DecryptUpdate(ctx, plaintext.data(), &len, ciphertext.data(), static_cast<int>(ciphertext.size())) != 1) {
            throw CryptoOperationException("Decryption failed");
        }
        plaintextLen = len;

        // Finalize decryption
        if (EVP_DecryptFinal_ex(ctx, plaintext.data() + len, &len) != 1) {
            throw CryptoOperationException("Decryption finalization failed");
        }
        plaintextLen += len;

        plaintext.resize(plaintextLen);

        // Remove padding if needed
        if (!isStreamCipher(algorithm) && !isAeadMode(algorithm)) {
            plaintext = removePadding(plaintext, padding, getBlockSize(algorithm));
        }

    } catch (...) {
        EVP_CIPHER_CTX_free(ctx);
        throw;
    }

    EVP_CIPHER_CTX_free(ctx);
    return plaintext;
#endif
}

// ChaCha20 encryption (simplified implementation)
EncryptionResult CryptoEngine::encryptChaCha20(
    const std::vector<uint8_t>& data,
    const std::vector<uint8_t>& key,
    CipherAlgorithm algorithm,
    const std::vector<uint8_t>& iv,
    const std::vector<uint8_t>& aad
) {
    // This is a simplified implementation
    // In a production environment, you would use a proper ChaCha20 implementation
    throw CryptoOperationException("ChaCha20 implementation not yet available");
}

// ChaCha20 decryption (simplified implementation)
std::vector<uint8_t> CryptoEngine::decryptChaCha20(
    const std::vector<uint8_t>& ciphertext,
    const std::vector<uint8_t>& key,
    CipherAlgorithm algorithm,
    const std::vector<uint8_t>& iv,
    const std::vector<uint8_t>& aad,
    const std::vector<uint8_t>& tag
) {
    // This is a simplified implementation
    // In a production environment, you would use a proper ChaCha20 implementation
    throw CryptoOperationException("ChaCha20 implementation not yet available");
}

// Key derivation functions
DerivedKey CryptoEngine::deriveKey(
    const std::string& password,
    const KeyDerivationOptions& options
) {
    std::vector<uint8_t> salt = randomBytes(options.saltLength);
    std::vector<uint8_t> key = deriveKeyWithSalt(password, salt, options);
    return DerivedKey{std::move(key), std::move(salt)};
}

std::vector<uint8_t> CryptoEngine::deriveKeyWithSalt(
    const std::string& password,
    const std::vector<uint8_t>& salt,
    const KeyDerivationOptions& options
) {
    switch (options.kdf) {
        case KeyDerivationFunction::PBKDF2:
            return pbkdf2(password, salt, options.iterations, options.keyLength, HashAlgorithm::SHA256);
        case KeyDerivationFunction::SCRYPT:
            return scrypt(password, salt, 16384, 8, 1, options.keyLength); // Standard scrypt parameters
        case KeyDerivationFunction::ARGON2:
            return argon2(password, salt, options.iterations, options.memory, options.parallelism, options.keyLength);
        default:
            throw InvalidParameterException("Unsupported key derivation function");
    }
}

// PBKDF2 implementation
std::vector<uint8_t> CryptoEngine::pbkdf2(
    const std::string& password,
    const std::vector<uint8_t>& salt,
    uint32_t iterations,
    uint32_t keyLength,
    HashAlgorithm hashAlg
) {
#ifdef NO_OPENSSL
    // Simplified PBKDF2 implementation - not cryptographically secure
    LOGE("PBKDF2 not implemented without OpenSSL");
    throw CryptoOperationException("PBKDF2 not available in simplified mode");
#else
    const EVP_MD* md = nullptr;
    
    switch (hashAlg) {
        case HashAlgorithm::SHA1:
            md = EVP_sha1();
            break;
        case HashAlgorithm::SHA256:
            md = EVP_sha256();
            break;
        case HashAlgorithm::SHA384:
            md = EVP_sha384();
            break;
        case HashAlgorithm::SHA512:
            md = EVP_sha512();
            break;
        default:
            throw InvalidParameterException("Unsupported hash algorithm for PBKDF2");
    }

    std::vector<uint8_t> key(keyLength);
    
    if (PKCS5_PBKDF2_HMAC(password.c_str(), static_cast<int>(password.length()),
                          salt.data(), static_cast<int>(salt.size()),
                          static_cast<int>(iterations), md,
                          static_cast<int>(keyLength), key.data()) != 1) {
        throw CryptoOperationException("PBKDF2 key derivation failed");
    }

    return key;
#endif
}

// Scrypt implementation (simplified)
std::vector<uint8_t> CryptoEngine::scrypt(
    const std::string& password,
    const std::vector<uint8_t>& salt,
    uint32_t N,
    uint32_t r,
    uint32_t p,
    uint32_t keyLength
) {
    // This would require a proper scrypt implementation
    // For now, fall back to PBKDF2
    return pbkdf2(password, salt, 100000, keyLength, HashAlgorithm::SHA256);
}

// Argon2 implementation (simplified)
std::vector<uint8_t> CryptoEngine::argon2(
    const std::string& password,
    const std::vector<uint8_t>& salt,
    uint32_t iterations,
    uint32_t memory,
    uint32_t parallelism,
    uint32_t keyLength
) {
    // This would require a proper Argon2 implementation
    // For now, fall back to PBKDF2
    return pbkdf2(password, salt, iterations, keyLength, HashAlgorithm::SHA256);
}

// SecureBuffer implementation
SecureBuffer::SecureBuffer(size_t size) : data_(nullptr), size_(0) {
    allocate(size);
}

SecureBuffer::~SecureBuffer() {
    deallocate();
}

SecureBuffer::SecureBuffer(SecureBuffer&& other) noexcept 
    : data_(other.data_), size_(other.size_) {
    other.data_ = nullptr;
    other.size_ = 0;
}

SecureBuffer& SecureBuffer::operator=(SecureBuffer&& other) noexcept {
    if (this != &other) {
        deallocate();
        data_ = other.data_;
        size_ = other.size_;
        other.data_ = nullptr;
        other.size_ = 0;
    }
    return *this;
}

void SecureBuffer::clear() {
    if (data_ && size_ > 0) {
        CryptoEngine::secureZero(data_, size_);
    }
}

void SecureBuffer::resize(size_t newSize) {
    if (newSize != size_) {
        deallocate();
        allocate(newSize);
    }
}

void SecureBuffer::allocate(size_t size) {
    if (size > 0) {
#ifdef NO_OPENSSL
        data_ = static_cast<uint8_t*>(malloc(size));
#else
        data_ = static_cast<uint8_t*>(OPENSSL_secure_malloc(size));
#endif
        if (!data_) {
            throw std::bad_alloc();
        }
        size_ = size;
    }
}

void SecureBuffer::deallocate() {
    if (data_) {
#ifdef NO_OPENSSL
        free(data_);
#else
        OPENSSL_secure_clear_free(data_, size_);
#endif
        data_ = nullptr;
        size_ = 0;
    }
}

} // namespace crypto_native 