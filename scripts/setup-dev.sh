#!/bin/bash

echo "🚀 SecAuth 开发环境设置"
echo "====================="

# 检查依赖
echo "📦 检查依赖..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 检查Java (Android构建需要)
if ! command -v java &> /dev/null; then
    echo "⚠️  Java 未安装，Android构建可能失败"
fi

# 检查Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME 环境变量未设置"
    echo "请安装Android Studio并设置ANDROID_HOME"
fi

echo "✅ 基础依赖检查完成"
echo ""

# 安装依赖
echo "📥 安装项目依赖..."
npm install

# 检查Expo CLI
if ! command -v expo &> /dev/null; then
    echo "📱 安装Expo CLI..."
    npm install -g @expo/cli
fi

echo ""
echo "🎯 可用的本地构建命令:"
echo "======================"
echo ""
echo "🤖 Android:"
echo "  npm run build:android:debug    - 构建Debug APK"
echo "  npm run build:android:local    - 构建Release APK"
echo "  npm run build:android:bundle   - 构建AAB包"
echo "  npm run build:android:clean    - 清理构建"
echo ""
echo "🏃 运行:"
echo "  npm run android                - 运行Android Debug"
echo "  npm run run:android:release    - 运行Android Release"
echo ""
echo "🔧 脚本:"
echo "  ./scripts/build-local.sh android release  - 完整Release构建"
echo "  ./scripts/build-local.sh android debug    - 完整Debug构建"
echo "  ./scripts/build-local.sh android bundle   - AAB构建"
echo ""
echo "✅ 开发环境设置完成!" 