#include "db/Database.h"
#include <iostream>

sqlite3* Database::db = nullptr;  // 👈 DEFINE static variable

bool Database::init(const std::string& dbPath) {
    int rc = sqlite3_open(dbPath.c_str(), &db);
    if (rc) {
        std::cerr << "[SQLite] Failed to open DB: " << sqlite3_errmsg(db) << std::endl;
        db = nullptr;
        return false;
    }
    std::cout << "[SQLite] Connected to database: " << dbPath << std::endl;
    return true;
}

sqlite3* Database::get() {
    return db;
}
