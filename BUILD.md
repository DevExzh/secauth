# SecAuth 本地构建指南

本文档介绍如何在本地构建SecAuth应用，无需使用EAS云端构建服务。

## 🏗️ 构建要求

### Android构建
- **Android Studio** (推荐最新版)
- **Android SDK 35** (通过Android Studio安装)
- **NDK 27.1.12297006** (通过Android Studio安装)
- **Java 17+** (推荐使用Android Studio自带的JDK)

### iOS构建 (仅macOS)
- **Xcode 15+**
- **CocoaPods** (`gem install cocoapods`)
- **iOS 15.1+ SDK**

## 🚀 快速开始

### 1. 环境设置
```bash
# 运行环境检查脚本
./scripts/setup-dev.sh
```

### 2. 安装依赖
```bash
npm install
```

## 📱 Android构建

### 可用命令

#### NPM脚本命令
```bash
# Debug构建
npm run build:android:debug

# Release构建 (APK)
npm run build:android:local

# AAB包构建 (用于Google Play)
npm run build:android:bundle

# 清理构建
npm run build:android:clean

# 运行Release版本
npm run run:android:release
```

#### 直接使用构建脚本
```bash
# 构建Debug APK
./scripts/build-local.sh android debug

# 构建Release APK
./scripts/build-local.sh android release

# 构建AAB包
./scripts/build-local.sh android bundle
```

#### 直接使用Gradle
```bash
cd android

# Debug构建
./gradlew assembleDebug

# Release构建
./gradlew assembleRelease

# AAB包构建
./gradlew bundleRelease

# 清理
./gradlew clean
```

### 构建输出位置

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB包**: `android/app/build/outputs/bundle/release/app-release.aab`

## 🍎 iOS构建 (仅macOS)

```bash
# iOS构建
./scripts/build-local.sh ios

# 或者直接使用
npx expo run:ios --configuration Release
```

## 🔧 配置说明

### Android SDK配置
项目已配置使用以下Android版本：
- **compileSdk**: 35
- **targetSdk**: 34  
- **minSdk**: 24
- **buildTools**: 35.0.0

### 自定义Native模块
项目包含两个自定义原生模块：
- **crypto-native**: 加密功能模块
- **otp-native**: OTP生成模块

这些模块会自动包含在构建中。

## 🐛 故障排除

### 常见问题

#### 1. SDK版本问题
```bash
# 检查Android SDK安装
./scripts/setup-dev.sh

# 重新生成项目
npx expo prebuild --clean --platform android
```

#### 2. 构建缓存问题
```bash
# 清理所有缓存
npm run build:android:clean
npm cache clean --force
cd android && ./gradlew clean
```

#### 3. NDK相关错误
确保在Android Studio中安装了正确版本的NDK (27.1.12297006)。

#### 4. Java版本问题
```bash
# 检查Java版本
java -version

# 应该是Java 17+
```

### 环境变量设置

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 📦 构建产物

### APK文件大小
- **Debug APK**: ~180MB (包含调试信息)
- **Release APK**: ~98MB (优化后)
- **AAB包**: ~48MB (Google Play优化)

### 签名
- Debug版本使用调试签名
- Release版本需要配置发布签名 (生产环境)

## 🔐 发布配置

生产环境发布时，需要配置签名密钥：

1. 生成发布密钥
2. 在 `android/app/build.gradle` 中配置签名
3. 设置环境变量或密钥文件

## ✨ 优化建议

1. **并行构建**: Gradle已配置并行构建
2. **缓存**: 启用Gradle构建缓存
3. **增量构建**: 避免不必要的清理操作
4. **资源优化**: 自动移除未使用资源

## 📚 相关文档

- [Expo Development Build](https://docs.expo.dev/development/build/)
- [Android开发者指南](https://developer.android.com/guide)
- [React Native构建指南](https://reactnative.dev/docs/running-on-device)
