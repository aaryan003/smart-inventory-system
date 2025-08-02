#pragma once
#include "crow.h"

crow::response getAllProducts();
crow::response addProduct(const crow::request& req);
crow::response getProductById(const crow::request& req, const std::string& id);
crow::response scanProductByBarcode(const crow::request& req);
crow::response updateProduct(const crow::request& req, const std::string& id);
crow::response deleteProduct(const std::string& id);
crow::response importProducts(const crow::request& req);
crow::response exportProducts();
