cmake_minimum_required(VERSION 3.15)
project(backend)

set(CMAKE_CXX_STANDARD 20)

# Set vcpkg toolchain path
set(CMAKE_TOOLCHAIN_FILE "C:/Users/aarya/.vcpkg-clion/vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")

include_directories(include)

file(GLOB_RECURSE SOURCES
        main.cpp
        routes/*.cpp
        controllers/*.cpp
        models/*.cpp
        db/*.cpp
)

add_executable(backend ${SOURCES})

find_package(Crow CONFIG REQUIRED)
find_package(SQLite3 REQUIRED)
find_package(Boost REQUIRED COMPONENTS uuid)

find_path(SQLITE_MODERN_CPP_INCLUDE_DIRS "sqlite_modern_cpp.h")
target_include_directories(backend PRIVATE ${SQLITE_MODERN_CPP_INCLUDE_DIRS})

find_path(FAST_CSV_INCLUDE_DIR csv.h PATH_SUFFIXES fast-cpp-csv-parser)
if(FAST_CSV_INCLUDE_DIR)
    message(STATUS "Found fast-cpp-csv-parser in ${FAST_CSV_INCLUDE_DIR}")
    target_include_directories(backend PRIVATE ${FAST_CSV_INCLUDE_DIR})
else()
    message(FATAL_ERROR "fast-cpp-csv-parser not found!")
endif()

target_include_directories(backend PRIVATE ${Boost_INCLUDE_DIRS})

target_link_libraries(backend PRIVATE
        Crow::Crow
        SQLite::SQLite3
        Boost::uuid
        ws2_32
        mswsock
)
