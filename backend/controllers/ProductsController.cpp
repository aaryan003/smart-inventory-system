#include "controllers/ProductsController.h"
#include "models/ProductModel.h"
#include <crow.h>
#include <iostream>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_generators.hpp>
#include <boost/uuid/uuid_io.hpp>

static std::string generateUUID() {
    static boost::uuids::random_generator generator;
    boost::uuids::uuid uuid = generator();
    return boost::uuids::to_string(uuid);
}

crow::response getAllProducts() {
    auto products = getAllProductsFromDB();
    auto json = serializeProductsToJson(products);
    return crow::response{json};
}

crow::response addProduct(const crow::request& req) {
    auto body = crow::json::load(req.body);
    if (!body)
        return crow::response(400, "Invalid JSON");

    if (!body.count("name") || !body.count("sku") || !body.count("barcode") || !body.count("category") || !body.count("stock") || !body.count("threshold") || !body.count("price")) {
        return crow::response(400, "Missing required fields");
    }

    std::string id = generateUUID();
    std::string name = body["name"].s();
    std::string sku = body["sku"].s();
    std::string barcode = body["barcode"].s();
    std::string category = body["category"].s();
    int stock = body["stock"].i();
    int threshold = body["threshold"].i();
    double price = body["price"].d();

    std::string statusStr = body.has("status") ? std::string(body["status"].s()) : std::string("in-stock");
    ProductStatus status = parseStatus(statusStr);

    bool success = insertProduct(id, name, sku, barcode, category, stock, threshold, price, status);
    if (!success)
        return crow::response(500, "Failed to insert product");

    crow::json::wvalue res;
    res["message"] = "Product added successfully";
    res["id"] = id;
    return crow::response(201, res);
}

crow::response getProductById(const crow::request& req, const std::string& id) {
    auto productOpt = getProductByIdFromDB(id);
    if (!productOpt.has_value()) {
        return crow::response(404, "Product not found");
    }
    return crow::response{productToJson(productOpt.value())};
}

crow::response scanProductByBarcode(const crow::request& req) {
    auto barcode = req.url_params.get("barcode");
    if (!barcode) {
        return crow::response(400, "Missing barcode");
    }
    auto productOpt = getProductByBarcode(barcode);
    if (!productOpt.has_value()) {
        return crow::response(404, "Product not found");
    }
    return crow::response{productToJson(productOpt.value())};
}

crow::response updateProduct(const crow::request& req, const std::string& id) {
    auto body = crow::json::load(req.body);
    if (!body)
        return crow::response(400, "Invalid JSON");

    if (!body.count("name") || body["name"].t() != crow::json::type::String ||
        !body.count("sku") || body["sku"].t() != crow::json::type::String ||
        !body.count("barcode") || body["barcode"].t() != crow::json::type::String ||
        !body.count("category") || body["category"].t() != crow::json::type::String ||
        !body.count("stock") || (body["stock"].t() != crow::json::type::Number) ||
        !body.count("threshold") || (body["threshold"].t() != crow::json::type::Number) ||
        !body.count("price") || (body["price"].t() != crow::json::type::Number)
    ) {
        return crow::response(400, "Missing or invalid fields in JSON body.");
    }

    auto existingProduct = getProductByIdFromDB(id);
    if (!existingProduct.has_value()) {
        return crow::response(404, "Product not found");
    }

    std::string name = body["name"].s();
    std::string sku = body["sku"].s();
    std::string barcode = body["barcode"].s();
    std::string category = body["category"].s();
    int stock = static_cast<int>(body["stock"].d());
    int threshold = static_cast<int>(body["threshold"].d());
    double price = body["price"].d();

    std::string statusStr = body.has("status") ? std::string(body["status"].s()) : "in-stock";
    ProductStatus status = parseStatus(statusStr);
    bool success = updateProductInDB(id, name, sku, barcode, category, stock, threshold, price, status);
    if (!success) {
        return crow::response(500, "Failed to update product");
    }

    return crow::response(200, "Product updated successfully");
}

crow::response deleteProduct(const std::string& id) {
    bool success = deleteProductFromDB(id);
    if (!success) {
        return crow::response(500, "Failed to delete product");
    }
    return crow::response(200, "Product and associated records deleted successfully");
}
