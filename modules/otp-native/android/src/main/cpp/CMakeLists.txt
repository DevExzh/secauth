cmake_minimum_required(VERSION 3.18)

project("otpnative")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add the source files
add_library(
    otpnative
    SHARED
    OtpGenerator.cpp
    OtpNativeJNI.cpp
)

# Find required packages
find_library(log-lib log)

# Link libraries
target_link_libraries(
    otpnative
    ${log-lib}
) 