#!/bin/bash

# SecAuth Icon Rebuild Script
# This script clears icon build caches and regenerates all icons

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_step() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    print_error "app.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if inkscape is available
if ! command -v inkscape &> /dev/null; then
    print_error "Inkscape is not installed. Please install it first:"
    echo "  macOS: brew install inkscape"
    echo "  Ubuntu: sudo apt-get install inkscape"
    echo "  Windows: Download from https://inkscape.org/release/"
    exit 1
fi

print_step "🧹 Clearing icon build caches..."

# Clear Android build caches and generated resources
if [ -d "android" ]; then
    print_step "Clearing Android caches..."
    rm -rf android/app/src/main/res/mipmap-*
    rm -rf android/app/src/main/res/drawable-*
    rm -rf android/build
    rm -rf android/.gradle
    rm -rf android/.kotlin
    print_success "Android caches cleared"
fi

# Clear iOS build caches
if [ -d "ios" ]; then
    print_step "Clearing iOS caches..."
    rm -rf ios/build
    rm -rf ios/DerivedData
    rm -rf ios/Pods
    rm -rf ios/Podfile.lock
    print_success "iOS caches cleared"
fi

# Clear Expo caches
print_step "Clearing Expo caches..."
rm -rf .expo
rm -rf node_modules/.cache

print_step "🎨 Regenerating PNG icons from SVG sources..."

# Regenerate main icon (1024x1024)
if [ -f "assets/images/secauth.svg" ]; then
    print_step "Generating main icon (1024x1024)..."
    inkscape --export-type=png --export-width=1024 --export-height=1024 \
        --export-filename=assets/images/icon.png assets/images/secauth.svg
    print_success "Main icon generated"
else
    print_warning "secauth.svg not found, skipping main icon generation"
fi

# Regenerate Android adaptive icon (432x432 for high quality)
if [ -f "assets/images/adaptive-icon-foreground.svg" ]; then
    print_step "Generating Android adaptive icon (432x432)..."
    inkscape --export-type=png --export-width=432 --export-height=432 \
        --export-filename=assets/images/adaptive-icon.png assets/images/adaptive-icon-foreground.svg
    print_success "Android adaptive icon generated"
else
    print_warning "adaptive-icon-foreground.svg not found, skipping Android adaptive icon generation"
fi

# Regenerate splash icon (256x256)
if [ -f "assets/images/secauth.svg" ]; then
    print_step "Generating splash icon (256x256)..."
    inkscape --export-type=png --export-width=256 --export-height=256 \
        --export-filename=assets/images/splash-icon.png assets/images/secauth.svg
    print_success "Splash icon generated"
fi

# Regenerate favicon (64x64)
if [ -f "assets/images/secauth.svg" ]; then
    print_step "Generating favicon (64x64)..."
    inkscape --export-type=png --export-width=64 --export-height=64 \
        --export-filename=assets/images/favicon.png assets/images/secauth.svg
    print_success "Favicon generated"
fi

print_step "📱 Regenerating native platform resources..."

# Prebuild to regenerate platform-specific resources
print_step "Running Expo prebuild..."
echo "y" | npx expo prebuild --clean > /dev/null 2>&1 || {
    print_warning "Prebuild encountered some issues, but icons may still be generated correctly"
}

print_step "📊 Checking generated files..."

# Check file sizes and report
check_file() {
    local file_path=$1
    local description=$2
    
    if [ -f "$file_path" ]; then
        local file_size=$(ls -lah "$file_path" | awk '{print $5}')
        print_success "$description: $file_size"
    else
        print_warning "$description: File not found"
    fi
}

check_file "assets/images/icon.png" "Main icon"
check_file "assets/images/adaptive-icon.png" "Android adaptive icon"
check_file "assets/images/splash-icon.png" "Splash icon"
check_file "assets/images/favicon.png" "Favicon"

# Check if Android resources were generated
if [ -f "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp" ]; then
    android_icon_size=$(ls -lah "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp" | awk '{print $5}')
    print_success "Android generated icon: $android_icon_size"
else
    print_warning "Android generated icon: Not found"
fi

print_success "🎉 Icon rebuild completed!"
print_step "Next steps:"
echo "  1. Test the app on both iOS and Android"
echo "  2. Check icon appearance in various themes and launchers"
echo "  3. Verify icons display correctly in app stores"

# Optional: Open assets folder to view results
if command -v open &> /dev/null; then
    read -p "Open assets/images folder to view generated icons? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open assets/images
    fi
fi 