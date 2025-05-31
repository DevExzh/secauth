#include <jni.h>
#include <fbjni/fbjni.h>
#include <android/log.h>
#include "CryptoEngine.h"
#include <map>
#include <string>

using namespace facebook::jni;
using namespace crypto_native;

#define LOG_TAG "CryptoNative"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Global crypto engine instance
static std::unique_ptr<CryptoEngine> g_cryptoEngine;

// Helper functions
namespace {

CipherAlgorithm stringToCipherAlgorithm(const std::string& algorithm) {
    if (algorithm == "AES_128_CBC") return CipherAlgorithm::AES_128_CBC;
    if (algorithm == "AES_192_CBC") return CipherAlgorithm::AES_192_CBC;
    if (algorithm == "AES_256_CBC") return CipherAlgorithm::AES_256_CBC;
    if (algorithm == "AES_128_GCM") return CipherAlgorithm::AES_128_GCM;
    if (algorithm == "AES_192_GCM") return CipherAlgorithm::AES_192_GCM;
    if (algorithm == "AES_256_GCM") return CipherAlgorithm::AES_256_GCM;
    if (algorithm == "AES_128_CTR") return CipherAlgorithm::AES_128_CTR;
    if (algorithm == "AES_192_CTR") return CipherAlgorithm::AES_192_CTR;
    if (algorithm == "AES_256_CTR") return CipherAlgorithm::AES_256_CTR;
    if (algorithm == "CHACHA20") return CipherAlgorithm::CHACHA20;
    if (algorithm == "CHACHA20_POLY1305") return CipherAlgorithm::CHACHA20_POLY1305;
    throw InvalidParameterException("Unknown cipher algorithm: " + algorithm);
}

PaddingMode stringToPaddingMode(const std::string& padding) {
    if (padding == "PKCS7") return PaddingMode::PKCS7;
    if (padding == "PKCS5") return PaddingMode::PKCS5;
    if (padding == "ISO10126") return PaddingMode::ISO10126;
    if (padding == "ANSIX923") return PaddingMode::ANSIX923;
    if (padding == "ZERO") return PaddingMode::ZERO;
    if (padding == "NONE") return PaddingMode::NONE;
    throw InvalidParameterException("Unknown padding mode: " + padding);
}

HashAlgorithm stringToHashAlgorithm(const std::string& algorithm) {
    if (algorithm == "SHA1") return HashAlgorithm::SHA1;
    if (algorithm == "SHA256") return HashAlgorithm::SHA256;
    if (algorithm == "SHA384") return HashAlgorithm::SHA384;
    if (algorithm == "SHA512") return HashAlgorithm::SHA512;
    if (algorithm == "MD5") return HashAlgorithm::MD5;
    throw InvalidParameterException("Unknown hash algorithm: " + algorithm);
}

KeyDerivationFunction stringToKDF(const std::string& kdf) {
    if (kdf == "PBKDF2") return KeyDerivationFunction::PBKDF2;
    if (kdf == "SCRYPT") return KeyDerivationFunction::SCRYPT;
    if (kdf == "ARGON2") return KeyDerivationFunction::ARGON2;
    throw InvalidParameterException("Unknown KDF: " + kdf);
}

std::vector<uint8_t> jbyteArrayToVector(JNIEnv* env, jbyteArray array) {
    if (!array) return {};
    
    jsize length = env->GetArrayLength(array);
    std::vector<uint8_t> result(length);
    env->GetByteArrayRegion(array, 0, length, reinterpret_cast<jbyte*>(result.data()));
    return result;
}

jbyteArray vectorToJbyteArray(JNIEnv* env, const std::vector<uint8_t>& data) {
    jbyteArray result = env->NewByteArray(static_cast<jsize>(data.size()));
    env->SetByteArrayRegion(result, 0, static_cast<jsize>(data.size()), 
                           reinterpret_cast<const jbyte*>(data.data()));
    return result;
}

jobject createHashMap(JNIEnv* env) {
    jclass hashMapClass = env->FindClass("java/util/HashMap");
    jmethodID hashMapInit = env->GetMethodID(hashMapClass, "<init>", "()V");
    return env->NewObject(hashMapClass, hashMapInit);
}

void putByteArrayInMap(JNIEnv* env, jobject map, const char* key, const std::vector<uint8_t>& value) {
    jclass hashMapClass = env->GetObjectClass(map);
    jmethodID putMethod = env->GetMethodID(hashMapClass, "put", 
                                          "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;");
    
    jstring keyStr = env->NewStringUTF(key);
    jbyteArray valueArray = vectorToJbyteArray(env, value);
    
    env->CallObjectMethod(map, putMethod, keyStr, valueArray);
    
    env->DeleteLocalRef(keyStr);
    env->DeleteLocalRef(valueArray);
}

} // anonymous namespace

extern "C" {

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    return facebook::jni::initialize(vm, [] {
        // Initialize crypto engine
        try {
            g_cryptoEngine = std::make_unique<CryptoEngine>();
            LOGI("CryptoEngine initialized successfully");
        } catch (const std::exception& e) {
            LOGE("Failed to initialize CryptoEngine: %s", e.what());
        }
    });
}

JNIEXPORT jobject JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeEncrypt(
    JNIEnv* env, jobject thiz,
    jbyteArray data, jbyteArray key, jstring algorithm, jstring padding,
    jbyteArray iv, jbyteArray aad) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        // Convert parameters
        auto dataVec = jbyteArrayToVector(env, data);
        auto keyVec = jbyteArrayToVector(env, key);
        
        const char* algorithmStr = env->GetStringUTFChars(algorithm, nullptr);
        const char* paddingStr = env->GetStringUTFChars(padding, nullptr);
        
        auto cipherAlg = stringToCipherAlgorithm(algorithmStr);
        auto paddingMode = stringToPaddingMode(paddingStr);
        
        auto ivVec = jbyteArrayToVector(env, iv);
        auto aadVec = jbyteArrayToVector(env, aad);

        // Perform encryption
        auto result = g_cryptoEngine->encrypt(dataVec, keyVec, cipherAlg, paddingMode, ivVec, aadVec);

        // Create result map
        jobject resultMap = createHashMap(env);
        putByteArrayInMap(env, resultMap, "ciphertext", result.ciphertext);
        putByteArrayInMap(env, resultMap, "iv", result.iv);
        
        if (!result.tag.empty()) {
            putByteArrayInMap(env, resultMap, "tag", result.tag);
        }

        // Cleanup
        env->ReleaseStringUTFChars(algorithm, algorithmStr);
        env->ReleaseStringUTFChars(padding, paddingStr);

        return resultMap;
        
    } catch (const std::exception& e) {
        LOGE("Encryption failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeDecrypt(
    JNIEnv* env, jobject thiz,
    jbyteArray ciphertext, jbyteArray key, jstring algorithm, jstring padding,
    jbyteArray iv, jbyteArray aad, jbyteArray tag) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        // Convert parameters
        auto ciphertextVec = jbyteArrayToVector(env, ciphertext);
        auto keyVec = jbyteArrayToVector(env, key);
        auto ivVec = jbyteArrayToVector(env, iv);
        auto aadVec = jbyteArrayToVector(env, aad);
        auto tagVec = jbyteArrayToVector(env, tag);
        
        const char* algorithmStr = env->GetStringUTFChars(algorithm, nullptr);
        const char* paddingStr = env->GetStringUTFChars(padding, nullptr);
        
        auto cipherAlg = stringToCipherAlgorithm(algorithmStr);
        auto paddingMode = stringToPaddingMode(paddingStr);

        // Perform decryption
        auto result = g_cryptoEngine->decrypt(ciphertextVec, keyVec, cipherAlg, ivVec, paddingMode, aadVec, tagVec);

        // Cleanup
        env->ReleaseStringUTFChars(algorithm, algorithmStr);
        env->ReleaseStringUTFChars(padding, paddingStr);

        return vectorToJbyteArray(env, result);
        
    } catch (const std::exception& e) {
        LOGE("Decryption failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeGenerateKey(
    JNIEnv* env, jobject thiz, jint length) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        auto result = g_cryptoEngine->generateKey(static_cast<size_t>(length));
        return vectorToJbyteArray(env, result);
        
    } catch (const std::exception& e) {
        LOGE("Key generation failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jobject JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeDeriveKey(
    JNIEnv* env, jobject thiz,
    jstring password, jstring kdf, jint iterations, jint saltLength, 
    jint keyLength, jint memory, jint parallelism) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        const char* passwordStr = env->GetStringUTFChars(password, nullptr);
        const char* kdfStr = env->GetStringUTFChars(kdf, nullptr);

        KeyDerivationOptions options;
        options.kdf = stringToKDF(kdfStr);
        options.iterations = static_cast<uint32_t>(iterations);
        options.saltLength = static_cast<uint32_t>(saltLength);
        options.keyLength = static_cast<uint32_t>(keyLength);
        options.memory = static_cast<uint32_t>(memory);
        options.parallelism = static_cast<uint32_t>(parallelism);

        auto result = g_cryptoEngine->deriveKey(passwordStr, options);

        // Create result map
        jobject resultMap = createHashMap(env);
        putByteArrayInMap(env, resultMap, "key", result.key);
        putByteArrayInMap(env, resultMap, "salt", result.salt);

        // Cleanup
        env->ReleaseStringUTFChars(password, passwordStr);
        env->ReleaseStringUTFChars(kdf, kdfStr);

        return resultMap;
        
    } catch (const std::exception& e) {
        LOGE("Key derivation failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeDeriveKeyWithSalt(
    JNIEnv* env, jobject thiz,
    jstring password, jbyteArray salt, jstring kdf, jint iterations,
    jint keyLength, jint memory, jint parallelism) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        const char* passwordStr = env->GetStringUTFChars(password, nullptr);
        const char* kdfStr = env->GetStringUTFChars(kdf, nullptr);
        auto saltVec = jbyteArrayToVector(env, salt);

        KeyDerivationOptions options;
        options.kdf = stringToKDF(kdfStr);
        options.iterations = static_cast<uint32_t>(iterations);
        options.keyLength = static_cast<uint32_t>(keyLength);
        options.memory = static_cast<uint32_t>(memory);
        options.parallelism = static_cast<uint32_t>(parallelism);

        auto result = g_cryptoEngine->deriveKeyWithSalt(passwordStr, saltVec, options);

        // Cleanup
        env->ReleaseStringUTFChars(password, passwordStr);
        env->ReleaseStringUTFChars(kdf, kdfStr);

        return vectorToJbyteArray(env, result);
        
    } catch (const std::exception& e) {
        LOGE("Key derivation with salt failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeHash(
    JNIEnv* env, jobject thiz, jbyteArray data, jstring algorithm) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        auto dataVec = jbyteArrayToVector(env, data);
        const char* algorithmStr = env->GetStringUTFChars(algorithm, nullptr);
        
        auto hashAlg = stringToHashAlgorithm(algorithmStr);
        auto result = g_cryptoEngine->hash(dataVec, hashAlg);

        // Cleanup
        env->ReleaseStringUTFChars(algorithm, algorithmStr);

        return vectorToJbyteArray(env, result);
        
    } catch (const std::exception& e) {
        LOGE("Hash operation failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeHmac(
    JNIEnv* env, jobject thiz, jbyteArray data, jbyteArray key, jstring algorithm) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        auto dataVec = jbyteArrayToVector(env, data);
        auto keyVec = jbyteArrayToVector(env, key);
        const char* algorithmStr = env->GetStringUTFChars(algorithm, nullptr);
        
        auto hashAlg = stringToHashAlgorithm(algorithmStr);
        auto result = g_cryptoEngine->hmac(dataVec, keyVec, hashAlg);

        // Cleanup
        env->ReleaseStringUTFChars(algorithm, algorithmStr);

        return vectorToJbyteArray(env, result);
        
    } catch (const std::exception& e) {
        LOGE("HMAC operation failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeRandomBytes(
    JNIEnv* env, jobject thiz, jint length) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        auto result = g_cryptoEngine->randomBytes(static_cast<size_t>(length));
        return vectorToJbyteArray(env, result);
        
    } catch (const std::exception& e) {
        LOGE("Random bytes generation failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return nullptr;
    }
}

JNIEXPORT jint JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeRandomInt(
    JNIEnv* env, jobject thiz, jint min, jint max) {
    
    try {
        if (!g_cryptoEngine) {
            throw CryptoOperationException("CryptoEngine not initialized");
        }

        auto result = g_cryptoEngine->randomInt(static_cast<uint32_t>(min), static_cast<uint32_t>(max));
        return static_cast<jint>(result);
        
    } catch (const std::exception& e) {
        LOGE("Random integer generation failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return 0;
    }
}

JNIEXPORT jboolean JNICALL
Java_dev_exzh_expo_crypto_CryptoNativeModule_nativeSecureCompare(
    JNIEnv* env, jobject thiz, jbyteArray a, jbyteArray b) {
    
    try {
        auto aVec = jbyteArrayToVector(env, a);
        auto bVec = jbyteArrayToVector(env, b);
        
        bool result = CryptoEngine::secureCompare(aVec, bVec);
        return static_cast<jboolean>(result);
        
    } catch (const std::exception& e) {
        LOGE("Secure comparison failed: %s", e.what());
        jclass exceptionClass = env->FindClass("java/lang/RuntimeException");
        env->ThrowNew(exceptionClass, e.what());
        return JNI_FALSE;
    }
}

} // extern "C" 