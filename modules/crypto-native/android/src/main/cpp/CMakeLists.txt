cmake_minimum_required(VERSION 3.18)

project(cryptonative)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(fbjni REQUIRED CONFIG)

# Add OpenSSL
find_package(PkgConfig REQUIRED)
pkg_check_modules(OPENSSL REQUIRED openssl)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

# Source files
set(SOURCES
    CryptoEngine.cpp
    CryptoNativeJNI.cpp
)

# Create shared library
add_library(${PROJECT_NAME} SHARED ${SOURCES})

# Link libraries
target_link_libraries(${PROJECT_NAME}
    fbjni::fbjni
    ${OPENSSL_LIBRARIES}
    android
    log
)

# Compiler flags
target_compile_options(${PROJECT_NAME} PRIVATE
    ${OPENSSL_CFLAGS_OTHER}
    -Wall
    -Wextra
    -O2
    -fvisibility=hidden
)

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE
    ${OPENSSL_INCLUDE_DIRS}
)

# Security flags
target_compile_definitions(${PROJECT_NAME} PRIVATE
    -D_FORTIFY_SOURCE=2
)

target_compile_options(${PROJECT_NAME} PRIVATE
    -fstack-protector-strong
    -Wformat
    -Wformat-security
) 