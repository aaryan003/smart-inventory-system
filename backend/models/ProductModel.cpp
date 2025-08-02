#include "models/ProductModel.h"
#include "db/Database.h"
#include <sqlite3.h>
#include <iostream>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_generators.hpp>
#include <boost/uuid/uuid_io.hpp>

std::string statusToString(ProductStatus status) {
    switch (status) {
        case ProductStatus::IN_STOCK: return "in-stock";
        case ProductStatus::LOW_STOCK: return "low-stock";
        case ProductStatus::OUT_OF_STOCK: return "out-of-stock";
        default: return "unknown";
    }
}

ProductStatus stringToStatus(const std::string& statusStr) {
    return parseStatus(statusStr);
}

// UUID generation using Boost.UUID
static std::string generateUUID() {
    static boost::uuids::random_generator generator;
    boost::uuids::uuid uuid = generator();
    return boost::uuids::to_string(uuid);
}

bool insertProduct(
    const std::string& id,
    const std::string& name,
    const std::string& sku,
    const std::string& barcode,
    const std::string& category,
    int stock,
    int threshold,
    double price,
    ProductStatus status
) {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    std::string sql = "INSERT INTO products (id, name, sku, barcode, category, stock, threshold, price, status) "
                      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Insert Prepare Failed: " << sqlite3_errmsg(db) << "\n";
        return false;
    }

    sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, name.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 3, sku.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 4, barcode.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 5, category.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 6, stock);
    sqlite3_bind_int(stmt, 7, threshold);
    sqlite3_bind_double(stmt, 8, price);
    sqlite3_bind_text(stmt, 9, statusToString(status).c_str(), -1, SQLITE_STATIC);

    bool success = sqlite3_step(stmt) == SQLITE_DONE;
    if (!success) {
        std::cerr << "Insert Failed: " << sqlite3_errmsg(db) << "\n";
    }
    sqlite3_finalize(stmt);
    return success;
}

std::vector<Product> getAllProductsFromDB() {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    std::vector<Product> products;
    std::string sql = "SELECT id, name, sku, barcode, category, stock, threshold, price, status FROM products";

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Select Prepare Failed: " << sqlite3_errmsg(db) << "\n";
        return products;
    }

    while(sqlite3_step(stmt) == SQLITE_ROW) {
        Product p;
        p.id = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        p.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        p.sku = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        p.barcode = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        p.category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        p.stock = sqlite3_column_int(stmt, 5);
        p.threshold = sqlite3_column_int(stmt, 6);
        p.price = sqlite3_column_double(stmt, 7);
        p.status = stringToStatus(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8)));

        products.push_back(p);
    }

    sqlite3_finalize(stmt);
    return products;
}

std::optional<Product> getProductByIdFromDB(const std::string& id) {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    std::string sql = "SELECT id, name, sku, barcode, category, stock, threshold, price, status FROM products WHERE id = ?";

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Select By ID Prepare Failed: " << sqlite3_errmsg(db) << "\n";
        return std::nullopt;
    }

    sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_STATIC);

    if(sqlite3_step(stmt) == SQLITE_ROW) {
        Product p;
        p.id = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        p.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        p.sku = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        p.barcode = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        p.category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        p.stock = sqlite3_column_int(stmt, 5);
        p.threshold = sqlite3_column_int(stmt, 6);
        p.price = sqlite3_column_double(stmt, 7);
        p.status = stringToStatus(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8)));

        sqlite3_finalize(stmt);
        return p;
    }

    sqlite3_finalize(stmt);
    return std::nullopt;
}

std::optional<Product> getProductByBarcode(const std::string& barcode) {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    std::string sql = "SELECT id, name, sku, barcode, category, stock, threshold, price, status FROM products WHERE barcode = ?";

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Select By Barcode Prepare Failed: " << sqlite3_errmsg(db) << "\n";
        return std::nullopt;
    }

    sqlite3_bind_text(stmt, 1, barcode.c_str(), -1, SQLITE_STATIC);

    if(sqlite3_step(stmt) == SQLITE_ROW) {
        Product p;
        p.id = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        p.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        p.sku = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        p.barcode = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        p.category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        p.stock = sqlite3_column_int(stmt, 5);
        p.threshold = sqlite3_column_int(stmt, 6);
        p.price = sqlite3_column_double(stmt, 7);
        p.status = stringToStatus(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8)));

        sqlite3_finalize(stmt);
        return p;
    }

    sqlite3_finalize(stmt);
    return std::nullopt;
}

std::vector<Product> searchProducts(const std::string& query) {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    std::vector<Product> products;
    std::string sql = "SELECT id, name, sku, barcode, category, stock, threshold, price, status FROM products WHERE name LIKE ? OR category LIKE ?";

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Search Prepare Failed: " << sqlite3_errmsg(db) << "\n";
        return products;
    }

    std::string pattern = "%" + query + "%";
    sqlite3_bind_text(stmt, 1, pattern.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, pattern.c_str(), -1, SQLITE_STATIC);

    while(sqlite3_step(stmt) == SQLITE_ROW) {
        Product p;
        p.id = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        p.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        p.sku = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        p.barcode = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        p.category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        p.stock = sqlite3_column_int(stmt, 5);
        p.threshold = sqlite3_column_int(stmt, 6);
        p.price = sqlite3_column_double(stmt, 7);
        p.status = stringToStatus(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8)));

        products.push_back(p);
    }

    sqlite3_finalize(stmt);
    return products;
}

bool updateProductInDB(
    const std::string& id,
    const std::string& name,
    const std::string& sku,
    const std::string& barcode,
    const std::string& category,
    int stock,
    int threshold,
    double price,
    ProductStatus status
) {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    std::string sql = "UPDATE products SET name = ?, sku = ?, barcode = ?, category = ?, stock = ?, threshold = ?, price = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

    if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Update Prepare Failed: " << sqlite3_errmsg(db) << "\n";
        return false;
    }

    sqlite3_bind_text(stmt, 1, name.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, sku.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 3, barcode.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 4, category.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 5, stock);
    sqlite3_bind_int(stmt, 6, threshold);
    sqlite3_bind_double(stmt, 7, price);
    sqlite3_bind_text(stmt, 8, statusToString(status).c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 9, id.c_str(), -1, SQLITE_STATIC);

    bool success = sqlite3_step(stmt) == SQLITE_DONE;
    if(!success) {
        std::cerr << "Update Failed: " << sqlite3_errmsg(db) << "\n";
    }
    sqlite3_finalize(stmt);
    return success;
}

bool deleteProductFromDB(const std::string& id) {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;

    try {
        char* errMsg = nullptr;
        if(sqlite3_exec(db, "BEGIN;", nullptr, nullptr, &errMsg) != SQLITE_OK) {
            std::cerr << "Begin transaction failed: " << errMsg << "\n";
            sqlite3_free(errMsg);
            return false;
        }

        std::string sql;

        // Delete alerts
        sql = "DELETE FROM alerts WHERE product_id = ?";
        if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) return false;
        sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_STATIC);
        if(sqlite3_step(stmt) != SQLITE_DONE) { sqlite3_finalize(stmt); return false; }
        sqlite3_finalize(stmt);

        // Delete inventory_settings
        sql = "DELETE FROM inventory_settings WHERE product_id = ?";
        if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) return false;
        sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_STATIC);
        if(sqlite3_step(stmt) != SQLITE_DONE) { sqlite3_finalize(stmt); return false; }
        sqlite3_finalize(stmt);

        // Delete product
        sql = "DELETE FROM products WHERE id = ?";
        if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) return false;
        sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_STATIC);
        if(sqlite3_step(stmt) != SQLITE_DONE) { sqlite3_finalize(stmt); return false; }
        sqlite3_finalize(stmt);

        if(sqlite3_exec(db, "COMMIT;", nullptr, nullptr, &errMsg) != SQLITE_OK) {
            std::cerr << "Commit transaction failed: " << errMsg << "\n";
            sqlite3_free(errMsg);
            return false;
        }

        return true;
    } catch(...) {
        sqlite3_exec(db, "ROLLBACK;", nullptr, nullptr, nullptr);
        return false;
    }
}
crow::json::wvalue productToJson(const Product& p) {
    crow::json::wvalue x;
    x["id"] = p.id;
    x["name"] = p.name;
    x["sku"] = p.sku;
    x["barcode"] = p.barcode;
    x["category"] = p.category;
    x["description"] = p.description;
    x["stock"] = p.stock;
    x["threshold"] = p.threshold;
    x["price"] = p.price;
    x["status"] = statusToString(p.status);
    return x;
}

crow::json::wvalue serializeProductsToJson(const std::vector<Product>& products) {
    crow::json::wvalue result;
    size_t i = 0;
    for (const auto& p : products) {
        result[i++] = productToJson(p);
    }
    return result;
}

std::vector<std::string> getAllCategoriesFromDB() {
    sqlite3* db = Database::get();
    sqlite3_stmt* stmt;
    std::vector<std::string> categories;
    std::string sql = "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''";
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK)
        return categories;

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        categories.emplace_back(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0)));
    }
    sqlite3_finalize(stmt);
    return categories;
}


