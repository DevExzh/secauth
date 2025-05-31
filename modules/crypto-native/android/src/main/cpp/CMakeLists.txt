cmake_minimum_required(VERSION 3.18)

project(cryptonative)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SOURCES
    CryptoEngine.cpp
    CryptoNativeJNI.cpp
)

# Create shared library
add_library(${PROJECT_NAME} SHARED ${SOURCES})

# Find required libraries
find_library(log-lib log)

# Link libraries
target_link_libraries(${PROJECT_NAME}
    ${log-lib}
    android
)

# Compiler flags
target_compile_options(${PROJECT_NAME} PRIVATE
    -Wall
    -Wextra
    -O2
    -fvisibility=hidden
    -fstack-protector-strong
    -Wformat
    -Wformat-security
)

# Security flags
target_compile_definitions(${PROJECT_NAME} PRIVATE
    -D_FORTIFY_SOURCE=2
    -DNO_OPENSSL
) 