# SecAuth - 双因素身份验证器

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~53.0.9-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

[中文文档](./README-zh_CN.md) | [English](./README.md)

SecAuth 是一款基于 React Native 和 Expo 构建的现代化、功能丰富的双因素身份验证（2FA）应用。它提供安全且用户友好的界面来管理您的所有 2FA 账户，具备邮件集成、云同步和智能账户管理等高级功能。

## ✨ 功能特色

### 🏠 核心身份验证
- **联系人式账户视图**：以直观的联系人列表样式展示所有 2FA 账户
- **实时验证码生成**：生成 TOTP、HOTP 和 Steam 身份验证码，并显示实时倒计时
- **多种添加方式**：支持二维码扫描或手动输入添加账户
- **一键复制分享**：一键复制验证码，配合触觉反馈
- **拖拽重排序**：通过直观的拖拽功能重新排列账户
- **账户类型筛选**：按服务类型筛选账户（社交、工作、金融等）

### 📧 邮件集成
- **智能邮件解析**：自动从邮件中提取 2FA 设置信息
- **邮箱账户绑定**：连接邮箱账户以自动发现新账户
- **邮件验证查看**：查看原始邮件内容进行验证设置
- **临时账户管理**：处理临时邮件验证码并自动清理
- **滑动删除**：通过滑动手势轻松删除临时账户

### 🔍 组织与搜索
- **高级搜索**：按名称、邮箱或服务提供商查找账户
- **分类筛选**：按类别组织账户（社交、工作、金融等）
- **智能分类**：根据服务类型自动分类
- **快速操作**：快速访问常用账户
- **上下文菜单**：右键或长按获取更多选项

### ⚙️ 自定义设置
- **主题支持**：深色和浅色模式，支持系统自动检测
- **自定义分类**：创建和管理自定义账户分类
- **安全设置**：配置应用锁、生物识别和备份选项
- **通知控制**：管理提醒和通知设置
- **性能优化**：增强的状态管理和内存泄漏防护

### ☁️ 云同步
- **WebDAV 支持**：使用兼容 WebDAV 的服务同步数据
- **云存储集成**：支持主流云存储服务商
- **跨设备同步**：在多个设备间无缝访问账户
- **冲突解决**：智能处理同步冲突和数据合并

### 🛠️ 开发与构建功能
- **本地构建支持**：无需云服务即可在本地构建 Android 和 iOS 应用
- **多架构支持**：支持 arm64-v8a、armeabi-v7a 和 x86_64 的 Android 构建
- **开发脚本**：自动化的设置和构建脚本，简化开发流程
- **原生模块集成**：自定义 C++/Swift 模块以提升性能

## 📱 应用截图

*截图即将添加*

## 🚀 快速开始

### 环境要求

- Node.js（v18 或更高版本）
- npm 或 yarn
- Expo CLI
- iOS 模拟器或 Android 模拟器（或真实设备）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/DevExzh/secauth.git
   cd secauth
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者
   yarn install
   ```

3. **设置开发环境**
   ```bash
   ./scripts/setup-dev.sh
   ```

4. **启动开发服务器**
   ```bash
   npm start
   # 或者
   yarn start
   ```

5. **在您的设备上运行**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## 🏗️ 本地构建

SecAuth 现在支持完整的本地构建，无需 EAS 云服务。

### 快速构建命令

```bash
# Android 构建
npm run build:android:local    # Release APK
npm run build:android:debug    # Debug APK
npm run build:android:bundle   # Google Play AAB 包
npm run build:android:clean    # 清理构建缓存

# iOS 构建（仅 macOS）
./scripts/build-local.sh ios

# 测试构建
npm run build:test
```

### 构建脚本使用

```bash
# 构建 Android Release APK
./scripts/build-local.sh android release

# 构建 Android Debug APK
./scripts/build-local.sh android debug

# 构建 Android AAB 包
./scripts/build-local.sh android bundle
```

### 构建要求

**Android：**
- Android Studio（推荐最新版）
- Android SDK 35
- NDK 27.1.12297006
- Java 17+

**iOS（仅 macOS）：**
- Xcode 15+
- CocoaPods
- iOS 15.1+ SDK

详细构建说明请参阅 [BUILD.md](BUILD.md)。

## 🏗️ 技术架构

### 技术栈
- **框架**：React Native 0.79.2
- **开发平台**：Expo ~53.0.9
- **编程语言**：TypeScript ~5.8.3
- **导航**：Expo Router ~5.0.5
- **样式**：NativeWind (Tailwind CSS) ~4.1.23
- **动画**：React Native Reanimated ~3.17.4
- **状态管理**：React Hooks + Context API，具备性能优化
- **OTP 生成**：高性能原生 C++/Swift 实现

### 核心依赖
- **相机与二维码**：`expo-camera`
- **安全存储**：`expo-secure-store`
- **UI 组件**：`lucide-react-native`、`react-native-svg`
- **拖拽功能**：`react-native-draggable-flatlist`
- **实用工具**：`expo-clipboard`、`expo-haptics`、`expo-linking`
- **原生模块**：自定义 C++/Swift 加密和 OTP 生成模块

### 性能优化

- **增强状态管理**：改进的验证码生成跟踪和定时器清理
- **内存泄漏防护**：自动清理间隔器和定时器
- **优化渲染**：高效的 AccountCard 渲染和进度跟踪
- **后台处理**：无阻塞的 OTP 生成以获得更好的用户体验

### 原生 OTP 实现

SecAuth 使用高性能的原生实现进行 OTP 生成：

- **多算法支持**：TOTP、HOTP、mOTP 和 Steam Guard
- **跨平台**：原生 C++（Android）和 Swift（iOS）实现
- **安全**：硬件加速的加密运算
- **快速**：亚毫秒级验证码生成
- **标准兼容**：符合 RFC 4226（HOTP）和 RFC 6238（TOTP）

**支持的 OTP 类型：**
- **TOTP**（基于时间）：标准 30 秒时间基础验证码
- **HOTP**（基于计数器）：计数器递增验证码
- **mOTP**（移动 OTP）：基于 PIN 的移动 OTP，支持可配置周期
- **Steam Guard**：Steam 专有的 5 字符字母数字验证码

### 项目结构
```
secauth/
├── app/                          # Expo Router 应用目录
│   ├── (tabs)/                   # 主要应用标签页
│   │   ├── index.tsx            # 首页（增强的筛选和清理功能）
│   │   ├── add.tsx              # 添加账户页面
│   │   └── profile.tsx          # 个人资料和设置
│   └── _layout.tsx              # 根布局，改进的错误边界
├── components/                   # 可复用组件
│   ├── account/
│   │   └── AccountCard.tsx      # 增强的滑动删除和性能优化
│   ├── ui/
│   │   ├── ContextMenu.tsx      # 改进的动态定位
│   │   └── ViewEmailModal.tsx   # 新增：邮件内容查看器
│   ├── settings/
│   │   └── EmailParsingScreen.tsx # 增强的邮件集成
│   └── layout/                  # 布局组件，包含筛选功能
├── services/                    # 业务逻辑服务
│   ├── otpService.ts           # 增强的错误处理
│   ├── emailService.ts         # 邮件集成与验证
│   └── accountService.ts       # 账户管理与清理功能
├── modules/                     # 原生模块
│   ├── crypto-native/          # 更新的原生加密模块
│   └── otp-native/             # 增强的原生 OTP 生成模块
├── scripts/                    # 新增：开发和构建脚本
│   ├── build-local.sh         # 本地构建自动化
│   ├── setup-dev.sh           # 开发环境设置
│   └── test-build.sh          # 构建测试工具
├── utils/                      # 工具函数
├── types/                      # 增强的 TypeScript 类型定义
├── constants/                  # 应用常量和配置
├── hooks/                      # 自定义 React Hooks
└── locales/                    # 多语言支持（EN、ES、ZH）
    ├── en/common.json         # 增强的新功能翻译
    ├── es/common.json         # 更新的西班牙语翻译
    └── zh/common.json         # 更新的中文翻译
```

## 🔧 使用方法

### 添加新账户

1. **通过二维码**
   - 点击应用中的"+"按钮
   - 选择"扫描二维码"
   - 将相机对准二维码
   - 账户将自动添加

2. **手动输入**
   - 点击"+"按钮
   - 选择"手动输入"
   - 填写账户详情（名称、密钥等）
   - 根据需要配置 TOTP/HOTP 设置

3. **通过邮件集成**
   - 在设置中连接您的邮箱账户
   - 应用自动检测 2FA 设置邮件
   - 查看原始邮件内容进行验证
   - 临时账户使用后自动清理

### 账户管理

- **重新排序账户**：长按并拖拽重新排列账户
- **按类型筛选**：使用筛选按钮显示特定类型的账户
- **快速操作**：使用上下文菜单获取更多选项
- **滑动删除**：在临时账户上左滑删除
- **搜索**：使用搜索栏快速查找特定账户

### 邮件集成

1. **连接邮箱账户**
   - 进入 个人资料 > 邮件设置
   - 添加您的邮件服务商凭据
   - 配置同步频率和解析选项

2. **自动账户检测**
   - 应用会扫描 2FA 设置邮件
   - 新账户会自动提取并添加
   - 查看原始邮件内容进行验证
   - 临时账户会自动清理

### 云同步

1. **设置 WebDAV**
   - 导航到 个人资料 > 云同步
   - 输入 WebDAV 服务器详情
   - 测试连接并启用同步

2. **配置同步设置**
   - 设置同步频率（手动、每小时、每天）
   - 选择冲突解决策略
   - 启用/禁用特定数据类型

## 🚀 发布与部署

### 自动化发布工作流

SecAuth 使用 GitHub Actions 进行自动构建和发布：

- **触发条件**：推送到 `release/**` 分支或手动触发工作流
- **多架构 Android**：为 arm64-v8a、armeabi-v7a 和 x86_64 构建 APK
- **iOS 支持**：构建生产就绪的 IPA 文件
- **自动变更日志**：从 git 提交生成变更日志
- **GitHub 发布**：创建包含可下载文件的发布版本

### 本地开发构建

```bash
# 设置开发环境
./scripts/setup-dev.sh

# 测试本地构建
npm run build:test

# 为特定平台本地构建
npm run build:android:local    # Android Release
npm run build:android:debug    # Android Debug
npm run build:android:bundle   # Android AAB
```

### 创建发布版本

1. **创建发布分支：**
   ```bash
   git checkout -b release/v1.0.0
   git push origin release/v1.0.0
   ```

2. **工作流将自动：**
   - 为所有架构构建 Android APK
   - 构建 iOS IPA
   - 生成变更日志
   - 创建标签为 `v1.0.0` 的 GitHub 发布版本

### 手动构建命令

```bash
# 生成变更日志
npm run changelog

# 为特定平台构建
npm run build:android    # 仅 Android
npm run build:ios        # 仅 iOS
npm run build:all        # 两个平台

# 开发构建
npm run build:dev        # 开发版本构建
npm run build:preview    # 预览版本构建
```

详细的发布说明请参阅 [BUILD.md](BUILD.md)。

## 🤝 贡献指南

我们欢迎贡献！请遵循以下步骤：

1. **Fork 仓库**
2. **创建功能分支**：`git checkout -b feature/amazing-feature`
3. **进行更改**并确保测试通过
4. **提交更改**：`git commit -m 'Add amazing feature'`
5. **推送到分支**：`git push origin feature/amazing-feature`
6. **打开 Pull Request**

### 开发指南

- 遵循现有的代码风格和约定
- 为所有新代码添加 TypeScript 类型
- 为新功能编写单元测试
- 根据需要更新文档
- 在 iOS 和 Android 平台上进行测试

## 🔒 安全性

SecAuth 非常重视安全性：

- **本地存储**：所有敏感数据都使用 Expo SecureStore 存储
- **无云端数据**：默认情况下，不会向外部服务器传输数据
- **可选同步**：云同步完全可选且由用户控制
- **开源透明**：开源代码确保完全透明度

## 📄 许可证

本项目基于 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 使用 [Expo](https://expo.dev/) 和 [React Native](https://reactnative.dev/) 构建
- 图标来自 [Lucide](https://lucide.dev/)
- 灵感来源于流行的身份验证器应用和社区反馈

## 📞 支持

- **问题反馈**：[GitHub Issues](https://github.com/DevExzh/secauth/issues)
- **讨论交流**：[GitHub Discussions](https://github.com/DevExzh/secauth/discussions)
- **文档说明**：[Wiki](https://github.com/DevExzh/secauth/wiki)

---

<div align="center">
  <strong>SecAuth</strong> - 安全、简单、智能
</div> 