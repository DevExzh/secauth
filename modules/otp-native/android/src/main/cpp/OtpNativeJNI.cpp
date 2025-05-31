#include <jni.h>
#include <string>
#include <vector>
#include <chrono>
#include "OtpGenerator.h"

extern "C" {

// Helper function to safely get string from JNI with minimal overhead
inline const char* safeGetStringUTFChars(JNIEnv *env, jstring jstr, jboolean *isCopy = nullptr) {
    if (!jstr) return "";
    return env->GetStringUTFChars(jstr, isCopy);
}

// Helper function to safely release string
inline void safeReleaseStringUTFChars(JNIEnv *env, jstring jstr, const char* cstr) {
    if (jstr && cstr) {
        env->ReleaseStringUTFChars(jstr, cstr);
    }
}

// Helper function to create result string with error handling
inline jstring createResultString(JNIEnv *env, const std::string& result) {
    if (result.empty()) {
        return env->NewStringUTF("");
    }
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateTOTPNative(JNIEnv *env, jobject thiz, jstring secret, jlong timeSlot, jint digits, jstring algorithm) {
    const char* secretStr = nullptr;
    const char* algorithmStr = nullptr;
    
    try {
        secretStr = safeGetStringUTFChars(env, secret);
        algorithmStr = safeGetStringUTFChars(env, algorithm);
        
        // Quick validation
        if (!secretStr || strlen(secretStr) == 0) {
            safeReleaseStringUTFChars(env, secret, secretStr);
            safeReleaseStringUTFChars(env, algorithm, algorithmStr);
            return env->NewStringUTF("");
        }
        
        std::string result = OtpGenerator::generateTOTP(secretStr, static_cast<uint64_t>(timeSlot), digits, algorithmStr);
        
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, algorithm, algorithmStr);
        
        return createResultString(env, result);
    } catch (const std::exception& e) {
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, algorithm, algorithmStr);
        return env->NewStringUTF("");
    }
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateHOTPNative(JNIEnv *env, jobject thiz, jstring secret, jlong counter, jint digits, jstring algorithm) {
    const char* secretStr = nullptr;
    const char* algorithmStr = nullptr;
    
    try {
        secretStr = safeGetStringUTFChars(env, secret);
        algorithmStr = safeGetStringUTFChars(env, algorithm);
        
        // Quick validation
        if (!secretStr || strlen(secretStr) == 0) {
            safeReleaseStringUTFChars(env, secret, secretStr);
            safeReleaseStringUTFChars(env, algorithm, algorithmStr);
            return env->NewStringUTF("");
        }
        
        std::string result = OtpGenerator::generateHOTP(secretStr, static_cast<uint64_t>(counter), digits, algorithmStr);
        
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, algorithm, algorithmStr);
        
        return createResultString(env, result);
    } catch (const std::exception& e) {
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, algorithm, algorithmStr);
        return env->NewStringUTF("");
    }
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateMOTPNative(JNIEnv *env, jobject thiz, jstring secret, jstring pin, jlong timeSlot) {
    const char* secretStr = nullptr;
    const char* pinStr = nullptr;
    
    try {
        secretStr = safeGetStringUTFChars(env, secret);
        pinStr = safeGetStringUTFChars(env, pin);
        
        // Quick validation
        if (!secretStr || strlen(secretStr) == 0 || !pinStr) {
            safeReleaseStringUTFChars(env, secret, secretStr);
            safeReleaseStringUTFChars(env, pin, pinStr);
            return env->NewStringUTF("");
        }
        
        std::string result = OtpGenerator::generateMOTP(secretStr, pinStr, static_cast<uint64_t>(timeSlot));
        
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, pin, pinStr);
        
        return createResultString(env, result);
    } catch (const std::exception& e) {
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, pin, pinStr);
        return env->NewStringUTF("");
    }
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateMOTPWithPeriodNative(JNIEnv *env, jobject thiz, jstring secret, jstring pin, jlong timeSlot, jint period) {
    const char* secretStr = nullptr;
    const char* pinStr = nullptr;
    
    try {
        secretStr = safeGetStringUTFChars(env, secret);
        pinStr = safeGetStringUTFChars(env, pin);
        
        // Quick validation
        if (!secretStr || strlen(secretStr) == 0 || !pinStr || period <= 0) {
            safeReleaseStringUTFChars(env, secret, secretStr);
            safeReleaseStringUTFChars(env, pin, pinStr);
            return env->NewStringUTF("");
        }
        
        std::string result = OtpGenerator::generateMOTPWithPeriod(secretStr, pinStr, static_cast<uint64_t>(timeSlot), period);
        
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, pin, pinStr);
        
        return createResultString(env, result);
    } catch (const std::exception& e) {
        safeReleaseStringUTFChars(env, secret, secretStr);
        safeReleaseStringUTFChars(env, pin, pinStr);
        return env->NewStringUTF("");
    }
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateSteamGuardNative(JNIEnv *env, jobject thiz, jstring secret, jlong timeSlot) {
    const char* secretStr = nullptr;
    
    try {
        secretStr = safeGetStringUTFChars(env, secret);
        
        // Quick validation
        if (!secretStr || strlen(secretStr) == 0) {
            safeReleaseStringUTFChars(env, secret, secretStr);
            return env->NewStringUTF("");
        }
        
        std::string result = OtpGenerator::generateSteamGuard(secretStr, static_cast<uint64_t>(timeSlot));
        
        safeReleaseStringUTFChars(env, secret, secretStr);
        
        return createResultString(env, result);
    } catch (const std::exception& e) {
        safeReleaseStringUTFChars(env, secret, secretStr);
        return env->NewStringUTF("");
    }
}

JNIEXPORT jboolean JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_validateSecretNative(JNIEnv *env, jobject thiz, jstring secret) {
    const char* secretStr = nullptr;
    
    try {
        secretStr = safeGetStringUTFChars(env, secret);
        
        // Quick validation
        if (!secretStr || strlen(secretStr) == 0) {
            safeReleaseStringUTFChars(env, secret, secretStr);
            return JNI_FALSE;
        }
        
        bool result = OtpGenerator::validateSecret(secretStr);
        
        safeReleaseStringUTFChars(env, secret, secretStr);
        
        return static_cast<jboolean>(result);
    } catch (const std::exception& e) {
        safeReleaseStringUTFChars(env, secret, secretStr);
        return JNI_FALSE;
    }
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_base32DecodeNative(JNIEnv *env, jobject thiz, jstring secret) {
    const char* secretStr = nullptr;
    
    try {
        secretStr = safeGetStringUTFChars(env, secret);
        
        // Quick validation
        if (!secretStr || strlen(secretStr) == 0) {
            safeReleaseStringUTFChars(env, secret, secretStr);
            return env->NewByteArray(0);
        }
        
        std::vector<uint8_t> result = OtpGenerator::base32Decode(secretStr);
        
        safeReleaseStringUTFChars(env, secret, secretStr);
        
        jbyteArray byteArray = env->NewByteArray(static_cast<jsize>(result.size()));
        if (byteArray != nullptr && !result.empty()) {
            env->SetByteArrayRegion(byteArray, 0, static_cast<jsize>(result.size()), 
                                   reinterpret_cast<const jbyte*>(result.data()));
        }
        
        return byteArray;
    } catch (const std::exception& e) {
        safeReleaseStringUTFChars(env, secret, secretStr);
        return env->NewByteArray(0);
    }
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_base32EncodeNative(JNIEnv *env, jobject thiz, jbyteArray data) {
    jbyte* bytes = nullptr;
    
    try {
        if (!data) {
            return env->NewStringUTF("");
        }
        
        jsize length = env->GetArrayLength(data);
        if (length <= 0) {
            return env->NewStringUTF("");
        }
        
        bytes = env->GetByteArrayElements(data, nullptr);
        if (!bytes) {
            return env->NewStringUTF("");
        }
        
        std::vector<uint8_t> dataVector(reinterpret_cast<uint8_t*>(bytes), 
                                       reinterpret_cast<uint8_t*>(bytes) + length);
        
        std::string result = OtpGenerator::base32Encode(dataVector);
        
        env->ReleaseByteArrayElements(data, bytes, JNI_ABORT);
        
        return createResultString(env, result);
    } catch (const std::exception& e) {
        if (bytes) {
            env->ReleaseByteArrayElements(data, bytes, JNI_ABORT);
        }
        return env->NewStringUTF("");
    }
}

} // extern "C" 