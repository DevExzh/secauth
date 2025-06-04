# SecAuth - Two-Factor Authentication App

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~53.0.9-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

[中文文档](./README-zh_CN.md) | [English](./README.md)

SecAuth is a modern, feature-rich two-factor authentication (2FA) app built with React Native and Expo. It provides a secure and user-friendly interface for managing all your 2FA accounts with advanced features like email integration, cloud synchronization, and intelligent account management.

## ✨ Features

### 🏠 Core Authentication
- **Contact-style Account View**: Display all 2FA accounts in an intuitive, contact-like list interface
- **Real-time Code Generation**: Generate TOTP, HOTP, and Steam authentication codes with live countdown timers
- **Multiple Entry Methods**: Add accounts via QR code scanning or manual entry
- **Copy & Share**: One-tap code copying with haptic feedback
- **Drag & Drop Reordering**: Reorganize accounts with intuitive drag-and-drop functionality
- **Account Type Filtering**: Filter accounts by service type (Social, Work, Finance, etc.)

### 📧 Email Integration
- **Smart Email Parsing**: Automatically extract 2FA setup information from emails
- **Email Account Binding**: Connect email accounts for automatic account discovery
- **Email Verification View**: View original email content for verification setup
- **Temporary Account Management**: Handle temporary email-based codes with automatic cleanup
- **Swipe-to-Delete**: Easy removal of temporary accounts with swipe gestures

### 🔍 Organization & Search
- **Advanced Search**: Find accounts by name, email, or service provider
- **Category Filtering**: Organize accounts by categories (Social, Work, Finance, etc.)
- **Smart Categorization**: Automatic categorization based on service type
- **Quick Actions**: Fast access to frequently used accounts
- **Context Menus**: Right-click or long-press for additional options

### ⚙️ Customization & Settings
- **Theme Support**: Dark and light mode with automatic system detection
- **Custom Categories**: Create and manage custom account categories
- **Security Settings**: Configure app lock, biometric authentication, and backup options
- **Notification Controls**: Manage alerts and reminders
- **Performance Optimizations**: Enhanced state management and memory leak prevention

### ☁️ Cloud Synchronization
- **WebDAV Support**: Sync data using WebDAV-compatible services
- **Cloud Storage Integration**: Support for popular cloud storage providers
- **Cross-device Sync**: Seamlessly access accounts across multiple devices
- **Conflict Resolution**: Smart handling of sync conflicts and data merging

### 🛠️ Development & Build Features
- **Local Build Support**: Build Android and iOS apps locally without cloud services
- **Multi-Architecture Support**: Android builds for arm64-v8a, armeabi-v7a, and x86_64
- **Development Scripts**: Automated setup and build scripts for streamlined development
- **Native Module Integration**: Custom C++/Swift modules for enhanced performance

## 📱 Screenshots

*Screenshots will be added soon*

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevExzh/secauth.git
   cd secauth
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up development environment**
   ```bash
   ./scripts/setup-dev.sh
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## 🏗️ Local Building

SecAuth now supports complete local building without requiring EAS cloud services.

### Quick Build Commands

```bash
# Android builds
npm run build:android:local    # Release APK
npm run build:android:debug    # Debug APK
npm run build:android:bundle   # AAB for Google Play
npm run build:android:clean    # Clean build cache

# iOS build (macOS only)
./scripts/build-local.sh ios

# Test builds
npm run build:test
```

### Build Script Usage

```bash
# Build Android Release APK
./scripts/build-local.sh android release

# Build Android Debug APK
./scripts/build-local.sh android debug

# Build Android AAB Bundle
./scripts/build-local.sh android bundle
```

### Build Requirements

**Android:**
- Android Studio (latest version recommended)
- Android SDK 35
- NDK 27.1.12297006
- Java 17+

**iOS (macOS only):**
- Xcode 15+
- CocoaPods
- iOS 15.1+ SDK

For detailed build instructions, see [BUILD.md](BUILD.md).

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: React Native 0.79.2
- **Development Platform**: Expo ~53.0.9
- **Language**: TypeScript ~5.8.3
- **Navigation**: Expo Router ~5.0.5
- **Styling**: NativeWind (Tailwind CSS) ~4.1.23
- **Animations**: React Native Reanimated ~3.17.4
- **State Management**: React Hooks + Context API with performance optimizations
- **OTP Generation**: Native C++/Swift implementation for high performance

### Key Dependencies
- **Camera & QR**: `expo-camera`
- **Security**: `expo-secure-store`
- **UI Components**: `lucide-react-native`, `react-native-svg`
- **Drag & Drop**: `react-native-draggable-flatlist`
- **Utilities**: `expo-clipboard`, `expo-haptics`, `expo-linking`
- **Native Modules**: Custom C++/Swift modules for cryptography and OTP generation

### Performance Optimizations

- **Enhanced State Management**: Improved code generation tracking and timer cleanup
- **Memory Leak Prevention**: Automatic cleanup of intervals and timers
- **Optimized Rendering**: Efficient AccountCard rendering with progress tracking
- **Background Processing**: Non-blocking OTP generation for better UX

### Native OTP Implementation

SecAuth uses a high-performance native implementation for OTP generation:

- **Multi-Algorithm Support**: TOTP, HOTP, mOTP, and Steam Guard
- **Cross-Platform**: Native C++ (Android) and Swift (iOS) implementations
- **Secure**: Hardware-accelerated cryptographic operations
- **Fast**: Sub-millisecond code generation
- **Standards Compliant**: RFC 4226 (HOTP) and RFC 6238 (TOTP)

**Supported OTP Types:**
- **TOTP** (Time-based): Standard 30-second time-based codes
- **HOTP** (Counter-based): Counter-incremented codes
- **mOTP** (Mobile OTP): PIN-based mobile OTP with configurable periods
- **Steam Guard**: Steam's proprietary 5-character alphanumeric codes

### Project Structure
```
secauth/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx            # Home screen (enhanced with filtering & cleanup)
│   │   ├── add.tsx              # Add account screen
│   │   └── profile.tsx          # Profile & settings
│   └── _layout.tsx              # Root layout with improved error boundaries
├── components/                   # Reusable components
│   ├── account/
│   │   └── AccountCard.tsx      # Enhanced with swipe-to-delete & performance opts
│   ├── ui/
│   │   ├── ContextMenu.tsx      # Improved dynamic positioning
│   │   └── ViewEmailModal.tsx   # New: Email content viewer
│   ├── settings/
│   │   └── EmailParsingScreen.tsx # Enhanced email integration
│   └── layout/                  # Layout components with filtering
├── services/                    # Business logic services
│   ├── otpService.ts           # Enhanced with improved error handling
│   ├── emailService.ts         # Email integration with verification
│   └── accountService.ts       # Account management with cleanup features
├── modules/                     # Native modules
│   ├── crypto-native/          # Updated native cryptography module
│   └── otp-native/             # Enhanced native OTP generation module
├── scripts/                    # New: Development and build scripts
│   ├── build-local.sh         # Local build automation
│   ├── setup-dev.sh           # Development environment setup
│   └── test-build.sh          # Build testing utilities
├── utils/                      # Utility functions
├── types/                      # Enhanced TypeScript type definitions
├── constants/                  # App constants and configuration
├── hooks/                      # Custom React hooks
└── locales/                    # Multi-language support (EN, ES, ZH)
    ├── en/common.json         # Enhanced with new feature translations
    ├── es/common.json         # Updated Spanish translations
    └── zh/common.json         # Updated Chinese translations
```

## 🔧 Usage

### Adding a New Account

1. **Via QR Code**
   - Tap the "+" button in the app
   - Select "Scan QR Code"
   - Point camera at the QR code
   - Account will be automatically added

2. **Manual Entry**
   - Tap the "+" button
   - Select "Manual Entry"
   - Fill in account details (name, secret key, etc.)
   - Configure TOTP/HOTP settings if needed

3. **Via Email Integration**
   - Connect your email account in settings
   - App automatically detects 2FA setup emails
   - View original email content for verification
   - Temporary accounts are auto-cleaned after use

### Account Management

- **Reorder Accounts**: Long-press and drag to reorder accounts
- **Filter by Type**: Use the filter buttons to show specific account types
- **Quick Actions**: Use context menus for additional options
- **Swipe to Delete**: Swipe left on temporary accounts to remove them
- **Search**: Use the search bar to quickly find specific accounts

### Email Integration

1. **Connect Email Account**
   - Go to Profile > Email Settings
   - Add your email provider credentials
   - Configure sync frequency and parsing options

2. **Automatic Account Detection**
   - The app scans for 2FA setup emails
   - New accounts are automatically extracted and added
   - View original email content for verification
   - Temporary accounts are automatically cleaned up

### Cloud Synchronization

1. **Setup WebDAV**
   - Navigate to Profile > Cloud Sync
   - Enter WebDAV server details
   - Test connection and enable sync

2. **Configure Sync Settings**
   - Set sync frequency (manual, hourly, daily)
   - Choose conflict resolution strategy
   - Enable/disable specific data types

## 🚀 Release & Deployment

### Automated Release Workflow

SecAuth uses GitHub Actions for automated building and releasing:

- **Triggers**: Push to `release/**` branches or manual workflow dispatch
- **Multi-Architecture Android**: Builds APKs for arm64-v8a, armeabi-v7a, and x86_64
- **iOS Support**: Builds production-ready IPA files
- **Automatic Changelog**: Generates changelogs from git commits
- **GitHub Releases**: Creates releases with downloadable artifacts

### Local Development Builds

```bash
# Set up development environment
./scripts/setup-dev.sh

# Test local builds
npm run build:test

# Build specific platforms locally
npm run build:android:local    # Android Release
npm run build:android:debug    # Android Debug
npm run build:android:bundle   # Android AAB
```

### Creating a Release

1. **Create a release branch:**
   ```bash
   git checkout -b release/v1.0.0
   git push origin release/v1.0.0
   ```

2. **The workflow automatically:**
   - Builds Android APKs for all architectures
   - Builds iOS IPA
   - Generates changelog
   - Creates GitHub release with tag `v1.0.0`

### Manual Build Commands

```bash
# Generate changelog
npm run changelog

# Build for specific platforms
npm run build:android    # Android only
npm run build:ios        # iOS only
npm run build:all        # Both platforms

# Development builds
npm run build:dev        # Development builds
npm run build:preview    # Preview builds
```

For detailed release instructions, see [BUILD.md](BUILD.md).

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and ensure tests pass
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add TypeScript types for all new code
- Write unit tests for new features
- Update documentation as needed
- Test on both iOS and Android platforms

## 🔒 Security

SecAuth takes security seriously:

- **Local Storage**: All sensitive data is stored using Expo SecureStore
- **No Cloud Data**: By default, no data is transmitted to external servers
- **Optional Sync**: Cloud sync is entirely optional and user-controlled
- **Open Source**: Full transparency with open-source code

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by popular authenticator apps and community feedback

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/DevExzh/secauth/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DevExzh/secauth/discussions)
- **Documentation**: [Wiki](https://github.com/DevExzh/secauth/wiki)

---

<div align="center">
  <strong>SecAuth</strong> - Secure, Simple, Smart
</div>
