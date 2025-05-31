package dev.exzh.expo.crypto

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.net.URL
import java.util.Base64

class CryptoNativeModule : Module() {
  
  companion object {
    init {
      System.loadLibrary("cryptonative")
    }
  }

  // Native method declarations
  private external fun nativeEncrypt(
    data: ByteArray,
    key: ByteArray,
    algorithm: String,
    padding: String,
    iv: ByteArray?,
    aad: ByteArray?
  ): Map<String, Any>

  private external fun nativeDecrypt(
    ciphertext: ByteArray,
    key: ByteArray,
    algorithm: String,
    padding: String,
    iv: ByteArray,
    aad: ByteArray?,
    tag: ByteArray?
  ): ByteArray

  private external fun nativeGenerateKey(length: Int): ByteArray

  private external fun nativeDeriveKey(
    password: String,
    kdf: String,
    iterations: Int,
    saltLength: Int,
    keyLength: Int,
    memory: Int,
    parallelism: Int
  ): Map<String, ByteArray>

  private external fun nativeDeriveKeyWithSalt(
    password: String,
    salt: ByteArray,
    kdf: String,
    iterations: Int,
    keyLength: Int,
    memory: Int,
    parallelism: Int
  ): ByteArray

  private external fun nativeHash(data: ByteArray, algorithm: String): ByteArray

  private external fun nativeHmac(data: ByteArray, key: ByteArray, algorithm: String): ByteArray

  private external fun nativeRandomBytes(length: Int): ByteArray

  private external fun nativeRandomInt(min: Int, max: Int): Int

  private external fun nativeSecureCompare(a: ByteArray, b: ByteArray): Boolean

  override fun definition() = ModuleDefinition {
    Name("CryptoNative")

    Constants(
      "PI" to Math.PI
    )

    Events("onChange")

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Core Cryptographic Functions
    AsyncFunction("encrypt") { data: String, key: String, options: Map<String, Any> ->
      try {
        val dataBytes = Base64.getDecoder().decode(data)
        val keyBytes = Base64.getDecoder().decode(key)
        
        val algorithm = options["algorithm"] as? String ?: throw IllegalArgumentException("Algorithm is required")
        val padding = options["padding"] as? String ?: "PKCS7"
        val ivString = options["iv"] as? String
        val aadString = options["aad"] as? String
        
        val ivBytes = ivString?.let { Base64.getDecoder().decode(it) }
        val aadBytes = aadString?.let { Base64.getDecoder().decode(it) }

        val result = nativeEncrypt(dataBytes, keyBytes, algorithm, padding, ivBytes, aadBytes)
        
        mapOf(
          "ciphertext" to Base64.getEncoder().encodeToString(result["ciphertext"] as ByteArray),
          "iv" to Base64.getEncoder().encodeToString(result["iv"] as ByteArray),
          "tag" to (result["tag"] as? ByteArray)?.let { Base64.getEncoder().encodeToString(it) }
        ).filterValues { it != null }
      } catch (e: Exception) {
        throw Exception("Encryption failed: ${e.message}")
      }
    }

    AsyncFunction("decrypt") { ciphertext: String, key: String, options: Map<String, Any> ->
      try {
        val ciphertextBytes = Base64.getDecoder().decode(ciphertext)
        val keyBytes = Base64.getDecoder().decode(key)
        
        val algorithm = options["algorithm"] as? String ?: throw IllegalArgumentException("Algorithm is required")
        val padding = options["padding"] as? String ?: "PKCS7"
        val iv = options["iv"] as? String ?: throw IllegalArgumentException("IV is required")
        val aadString = options["aad"] as? String
        val tagString = options["tag"] as? String
        
        val ivBytes = Base64.getDecoder().decode(iv)
        val aadBytes = aadString?.let { Base64.getDecoder().decode(it) }
        val tagBytes = tagString?.let { Base64.getDecoder().decode(it) }

        val result = nativeDecrypt(ciphertextBytes, keyBytes, algorithm, padding, ivBytes, aadBytes, tagBytes)
        
        Base64.getEncoder().encodeToString(result)
      } catch (e: Exception) {
        throw Exception("Decryption failed: ${e.message}")
      }
    }

    // Key Management
    AsyncFunction("generateKey") { length: Int ->
      try {
        val key = nativeGenerateKey(length)
        Base64.getEncoder().encodeToString(key)
      } catch (e: Exception) {
        throw Exception("Key generation failed: ${e.message}")
      }
    }

    AsyncFunction("deriveKey") { password: String, options: Map<String, Any> ->
      try {
        val kdf = options["kdf"] as? String ?: "PBKDF2"
        val iterations = options["iterations"] as? Int ?: 100000
        val saltLength = options["saltLength"] as? Int ?: 32
        val keyLength = options["keyLength"] as? Int ?: 32
        val memory = options["memory"] as? Int ?: 0
        val parallelism = options["parallelism"] as? Int ?: 1

        val result = nativeDeriveKey(password, kdf, iterations, saltLength, keyLength, memory, parallelism)
        
        mapOf(
          "key" to Base64.getEncoder().encodeToString(result["key"]!!),
          "salt" to Base64.getEncoder().encodeToString(result["salt"]!!)
        )
      } catch (e: Exception) {
        throw Exception("Key derivation failed: ${e.message}")
      }
    }

    AsyncFunction("deriveKeyWithSalt") { password: String, salt: String, options: Map<String, Any> ->
      try {
        val saltBytes = Base64.getDecoder().decode(salt)
        val kdf = options["kdf"] as? String ?: "PBKDF2"
        val iterations = options["iterations"] as? Int ?: 100000
        val keyLength = options["keyLength"] as? Int ?: 32
        val memory = options["memory"] as? Int ?: 0
        val parallelism = options["parallelism"] as? Int ?: 1

        val result = nativeDeriveKeyWithSalt(password, saltBytes, kdf, iterations, keyLength, memory, parallelism)
        
        Base64.getEncoder().encodeToString(result)
      } catch (e: Exception) {
        throw Exception("Key derivation with salt failed: ${e.message}")
      }
    }

    // Hashing and HMAC
    AsyncFunction("hash") { data: String, algorithm: String ->
      try {
        val dataBytes = Base64.getDecoder().decode(data)
        val result = nativeHash(dataBytes, algorithm)
        Base64.getEncoder().encodeToString(result)
      } catch (e: Exception) {
        throw Exception("Hash operation failed: ${e.message}")
      }
    }

    AsyncFunction("hmac") { data: String, key: String, options: Map<String, Any> ->
      try {
        val dataBytes = Base64.getDecoder().decode(data)
        val keyBytes = Base64.getDecoder().decode(key)
        val algorithm = options["algorithm"] as? String ?: "SHA256"

        val result = nativeHmac(dataBytes, keyBytes, algorithm)
        Base64.getEncoder().encodeToString(result)
      } catch (e: Exception) {
        throw Exception("HMAC operation failed: ${e.message}")
      }
    }

    // Random Number Generation
    AsyncFunction("randomBytes") { options: Map<String, Any> ->
      try {
        val length = options["length"] as? Int ?: throw IllegalArgumentException("Length is required")
        val result = nativeRandomBytes(length)
        Base64.getEncoder().encodeToString(result)
      } catch (e: Exception) {
        throw Exception("Random bytes generation failed: ${e.message}")
      }
    }

    AsyncFunction("randomInt") { min: Int, max: Int ->
      try {
        nativeRandomInt(min, max)
      } catch (e: Exception) {
        throw Exception("Random integer generation failed: ${e.message}")
      }
    }

    // Utility Functions
    AsyncFunction("encodeBase64") { data: String ->
      try {
        Base64.getEncoder().encodeToString(data.toByteArray(Charsets.UTF_8))
      } catch (e: Exception) {
        throw Exception("Base64 encoding failed: ${e.message}")
      }
    }

    AsyncFunction("decodeBase64") { data: String ->
      try {
        String(Base64.getDecoder().decode(data), Charsets.UTF_8)
      } catch (e: Exception) {
        throw Exception("Base64 decoding failed: ${e.message}")
      }
    }

    AsyncFunction("hexToBase64") { hex: String ->
      try {
        val bytes = hex.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
        Base64.getEncoder().encodeToString(bytes)
      } catch (e: Exception) {
        throw Exception("Hex to Base64 conversion failed: ${e.message}")
      }
    }

    AsyncFunction("base64ToHex") { base64: String ->
      try {
        val bytes = Base64.getDecoder().decode(base64)
        bytes.joinToString("") { "%02x".format(it) }
      } catch (e: Exception) {
        throw Exception("Base64 to hex conversion failed: ${e.message}")
      }
    }

    // Security Utilities
    AsyncFunction("secureCompare") { a: String, b: String ->
      try {
        val aBytes = a.toByteArray(Charsets.UTF_8)
        val bBytes = b.toByteArray(Charsets.UTF_8)
        nativeSecureCompare(aBytes, bBytes)
      } catch (e: Exception) {
        throw Exception("Secure comparison failed: ${e.message}")
      }
    }
  }
}
