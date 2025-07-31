#include "models/InventoryModel.h"
#include "db/Database.h"
#include "models/ProductModel.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <csv.h> // vcpkg provides this
#include <sqlite3.h>

std::vector<Product> InventoryModel::fetchInventoryOverview() {
    std::vector<Product> products;
    sqlite3* db = Database::get();
    if (!db) return products;

    const char* sql = "SELECT id, name, description, quantity, price, category, status FROM products;";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            Product p;
            p.id = sqlite3_column_int(stmt, 0);
            p.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
            p.description = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
            p.stock = sqlite3_column_int(stmt, 3);
            p.price = sqlite3_column_double(stmt, 4);
            p.category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
            p.status = parseStatus(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6)));
            products.push_back(p);
        }
        sqlite3_finalize(stmt);
    } else {
        std::cerr << "[SQLite] Failed to fetch products: " << sqlite3_errmsg(db) << std::endl;
    }

    return products;
}

std::vector<InventoryAlert> InventoryModel::fetchInventoryAlerts() {
    std::vector<InventoryAlert> alerts;
    sqlite3* db = Database::get();
    if (!db) return alerts;

    const char* sql = "SELECT id, product_id, message, threshold FROM alerts;";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            InventoryAlert alert;
            alert.id = sqlite3_column_int(stmt, 0);
            alert.productId = sqlite3_column_int(stmt, 1);
            alert.message = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
            alert.threshold = sqlite3_column_int(stmt, 3);
            alerts.push_back(alert);
        }
        sqlite3_finalize(stmt);
    } else {
        std::cerr << "[SQLite] Failed to fetch alerts: " << sqlite3_errmsg(db) << std::endl;
    }

    return alerts;
}

bool InventoryModel::deleteInventoryAlert(int alertId) {
    sqlite3* db = Database::get();
    if (!db) return false;

    const char* sql = "DELETE FROM alerts WHERE id = ?";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_int(stmt, 1, alertId);
        if (sqlite3_step(stmt) == SQLITE_DONE) {
            sqlite3_finalize(stmt);
            return true;
        }
        sqlite3_finalize(stmt);
    }

    std::cerr << "[SQLite] Failed to delete alert: " << sqlite3_errmsg(db) << std::endl;
    return false;
}

bool InventoryModel::updateStockQuantity(int productId, int newQuantity) {
    sqlite3* db = Database::get();
    if (!db) return false;

    const char* sql = "UPDATE products SET quantity = ? WHERE id = ?";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_int(stmt, 1, newQuantity);
        sqlite3_bind_int(stmt, 2, productId);
        if (sqlite3_step(stmt) == SQLITE_DONE) {
            sqlite3_finalize(stmt);
            return true;
        }
        sqlite3_finalize(stmt);
    }

    std::cerr << "[SQLite] Failed to update quantity: " << sqlite3_errmsg(db) << std::endl;
    return false;
}

bool InventoryModel::importCSV(const std::string& filePath) {
    try {
        io::CSVReader<4> in(filePath); // Adjust number of columns
        in.read_header(io::ignore_extra_column, "id", "name", "quantity", "status");

        sqlite3* db = Database::get();
        sqlite3_stmt* stmt;
        const char* insert_sql = "INSERT OR REPLACE INTO products (id, name, quantity, status) VALUES (?, ?, ?, ?)";

        if (sqlite3_prepare_v2(db, insert_sql, -1, &stmt, nullptr) != SQLITE_OK) {
            std::cerr << "Failed to prepare import statement.\n";
            return false;
        }

        int id, quantity;
        std::string name, status;

        while (in.read_row(id, name, quantity, status)) {
            sqlite3_bind_int(stmt, 1, id);
            sqlite3_bind_text(stmt, 2, name.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_int(stmt, 3, quantity);
            sqlite3_bind_text(stmt, 4, status.c_str(), -1, SQLITE_STATIC);

            if (sqlite3_step(stmt) != SQLITE_DONE) {
                std::cerr << "Failed to execute insert during import.\n";
                sqlite3_finalize(stmt);
                return false;
            }
            sqlite3_reset(stmt);
        }

        sqlite3_finalize(stmt);
        return true;
    } catch (const std::exception& e) {
        std::cerr << "CSV import error: " << e.what() << '\n';
        return false;
    }
}

bool InventoryModel::exportCSV(const std::string& filePath) {
    std::ofstream file(filePath);
    if (!file.is_open()) return false;

    file << "id,name,quantity,status\n";

    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    const char* select_sql = "SELECT id, name, quantity, status FROM products";

    if (sqlite3_prepare_v2(db, select_sql, -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Failed to prepare export SELECT.\n";
        return false;
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        int id = sqlite3_column_int(stmt, 0);
        const unsigned char* name = sqlite3_column_text(stmt, 1);
        int quantity = sqlite3_column_int(stmt, 2);
        const unsigned char* status = sqlite3_column_text(stmt, 3);

        file << id << "," << name << "," << quantity << "," << status << "\n";
    }

    sqlite3_finalize(stmt);
    file.close();
    return true;
}