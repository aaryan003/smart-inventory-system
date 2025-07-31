#ifndef DATABASE_H
#define DATABASE_H

#include <sqlite3.h>
#include <string>

class Database {
public:
    static bool init(const std::string& dbPath);
    static sqlite3* get();

private:
    static sqlite3* db;
};

#endif
