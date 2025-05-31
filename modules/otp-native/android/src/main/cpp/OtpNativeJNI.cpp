#include <jni.h>
#include <string>
#include <vector>
#include "OtpGenerator.h"

extern "C" {

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateTOTPNative(JNIEnv *env, jobject thiz, jstring secret, jlong timeSlot, jint digits, jstring algorithm) {
    const char* secretStr = env->GetStringUTFChars(secret, nullptr);
    const char* algorithmStr = env->GetStringUTFChars(algorithm, nullptr);
    
    std::string result = OtpGenerator::generateTOTP(secretStr, static_cast<uint64_t>(timeSlot), digits, algorithmStr);
    
    env->ReleaseStringUTFChars(secret, secretStr);
    env->ReleaseStringUTFChars(algorithm, algorithmStr);
    
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateHOTPNative(JNIEnv *env, jobject thiz, jstring secret, jlong counter, jint digits, jstring algorithm) {
    const char* secretStr = env->GetStringUTFChars(secret, nullptr);
    const char* algorithmStr = env->GetStringUTFChars(algorithm, nullptr);
    
    std::string result = OtpGenerator::generateHOTP(secretStr, static_cast<uint64_t>(counter), digits, algorithmStr);
    
    env->ReleaseStringUTFChars(secret, secretStr);
    env->ReleaseStringUTFChars(algorithm, algorithmStr);
    
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateMOTPNative(JNIEnv *env, jobject thiz, jstring secret, jstring pin, jlong timeSlot) {
    const char* secretStr = env->GetStringUTFChars(secret, nullptr);
    const char* pinStr = env->GetStringUTFChars(pin, nullptr);
    
    std::string result = OtpGenerator::generateMOTP(secretStr, pinStr, static_cast<uint64_t>(timeSlot));
    
    env->ReleaseStringUTFChars(secret, secretStr);
    env->ReleaseStringUTFChars(pin, pinStr);
    
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateMOTPWithPeriodNative(JNIEnv *env, jobject thiz, jstring secret, jstring pin, jlong timeSlot, jint period) {
    const char* secretStr = env->GetStringUTFChars(secret, nullptr);
    const char* pinStr = env->GetStringUTFChars(pin, nullptr);
    
    std::string result = OtpGenerator::generateMOTPWithPeriod(secretStr, pinStr, static_cast<uint64_t>(timeSlot), period);
    
    env->ReleaseStringUTFChars(secret, secretStr);
    env->ReleaseStringUTFChars(pin, pinStr);
    
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_generateSteamGuardNative(JNIEnv *env, jobject thiz, jstring secret, jlong timeSlot) {
    const char* secretStr = env->GetStringUTFChars(secret, nullptr);
    
    std::string result = OtpGenerator::generateSteamGuard(secretStr, static_cast<uint64_t>(timeSlot));
    
    env->ReleaseStringUTFChars(secret, secretStr);
    
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jboolean JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_validateSecretNative(JNIEnv *env, jobject thiz, jstring secret) {
    const char* secretStr = env->GetStringUTFChars(secret, nullptr);
    
    bool result = OtpGenerator::validateSecret(secretStr);
    
    env->ReleaseStringUTFChars(secret, secretStr);
    
    return static_cast<jboolean>(result);
}

JNIEXPORT jbyteArray JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_base32DecodeNative(JNIEnv *env, jobject thiz, jstring secret) {
    const char* secretStr = env->GetStringUTFChars(secret, nullptr);
    
    std::vector<uint8_t> result = OtpGenerator::base32Decode(secretStr);
    
    env->ReleaseStringUTFChars(secret, secretStr);
    
    jbyteArray byteArray = env->NewByteArray(static_cast<jsize>(result.size()));
    if (byteArray != nullptr && !result.empty()) {
        env->SetByteArrayRegion(byteArray, 0, static_cast<jsize>(result.size()), 
                               reinterpret_cast<const jbyte*>(result.data()));
    }
    
    return byteArray;
}

JNIEXPORT jstring JNICALL
Java_dev_exzh_expo_otp_OtpNativeModule_base32EncodeNative(JNIEnv *env, jobject thiz, jbyteArray data) {
    jsize length = env->GetArrayLength(data);
    jbyte* bytes = env->GetByteArrayElements(data, nullptr);
    
    std::vector<uint8_t> dataVector(reinterpret_cast<uint8_t*>(bytes), 
                                   reinterpret_cast<uint8_t*>(bytes) + length);
    
    std::string result = OtpGenerator::base32Encode(dataVector);
    
    env->ReleaseByteArrayElements(data, bytes, JNI_ABORT);
    
    return env->NewStringUTF(result.c_str());
}

} // extern "C" 