#!/bin/bash

# 本地构建脚本
set -e

echo "🔨 SecAuth 本地构建脚本"
echo "======================="

# 检查参数
PLATFORM=${1:-android}
BUILD_TYPE=${2:-release}

echo "📱 平台: $PLATFORM"
echo "🏗️  构建类型: $BUILD_TYPE"
echo ""

# 清理缓存
echo "🧹 清理缓存..."
npm cache clean --force
cd android && ./gradlew clean && cd ..

case $PLATFORM in
  "android")
    echo "🤖 开始Android构建..."
    
    case $BUILD_TYPE in
      "debug")
        echo "构建Debug版本..."
        cd android && ./gradlew assembleDebug
        echo "✅ Debug APK 构建完成!"
        echo "📍 位置: android/app/build/outputs/apk/debug/"
        ;;
      "release")
        echo "构建Release版本..."
        cd android && ./gradlew assembleRelease
        echo "✅ Release APK 构建完成!"
        echo "📍 位置: android/app/build/outputs/apk/release/"
        ;;
      "bundle")
        echo "构建AAB包..."
        cd android && ./gradlew bundleRelease
        echo "✅ AAB 构建完成!"
        echo "📍 位置: android/app/build/outputs/bundle/release/"
        ;;
      *)
        echo "❌ 未知构建类型: $BUILD_TYPE"
        echo "支持的类型: debug, release, bundle"
        exit 1
        ;;
    esac
    ;;
  "ios")
    echo "🍎 iOS构建 (需要macOS和Xcode)..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      npx expo run:ios --configuration Release
      echo "✅ iOS构建完成!"
    else
      echo "❌ iOS构建需要在macOS上进行"
      exit 1
    fi
    ;;
  *)
    echo "❌ 未知平台: $PLATFORM"
    echo "支持的平台: android, ios"
    exit 1
    ;;
esac

echo ""
echo "🎉 构建完成!" 