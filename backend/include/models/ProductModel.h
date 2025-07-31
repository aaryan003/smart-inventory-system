#pragma once
#include <vector>
#include <string>
#include <optional>
#include "crow.h"

enum class ProductStatus {
    IN_STOCK,    // corresponds to 'in-stock'
    LOW_STOCK,   // corresponds to 'low-stock'
    OUT_OF_STOCK,
    UNKNOWN
};

inline ProductStatus parseStatus(const std::string& s) {
    if (s == "in-stock") return ProductStatus::IN_STOCK;
    if (s == "low-stock") return ProductStatus::LOW_STOCK;
    if (s == "out-of-stock") return ProductStatus::OUT_OF_STOCK;
    return ProductStatus::UNKNOWN;
}

struct Product {
    std::string id;
    std::string name;
    std::string sku;
    std::string category;
    std::string description;
    std::string barcode;
    int stock;
    int threshold;
    double price;
    ProductStatus status;
};

// DB operations
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
);

std::vector<Product> getAllProductsFromDB();
std::optional<Product> getProductByIdFromDB(const std::string& id);
std::optional<Product> getProductByBarcode(const std::string& barcode);
std::vector<Product> searchProducts(const std::string& query);

// Serialization
crow::json::wvalue serializeProductsToJson(const std::vector<Product>& products);
crow::json::wvalue productToJson(const Product& p);

// Update and Delete
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
);

bool deleteProductFromDB(const std::string& id);
std::vector<std::string> getAllCategoriesFromDB();

