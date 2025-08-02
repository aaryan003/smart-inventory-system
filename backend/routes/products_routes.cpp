#include "routes/products_routes.h"
#include "controllers/ProductsController.h"
#include "models/ProductModel.h"
#include "middleware/CorsMiddleware.h"

template <typename App>
void setupProductRoutes(App& app) {
    // GET /api/products - List all products
    CROW_ROUTE(app, "/api/products").methods("GET"_method)([] {
        return getAllProducts();
    });

    // POST /api/products - Add new product
    CROW_ROUTE(app, "/api/products").methods("POST"_method)([](const crow::request& req) {
        return addProduct(req);
    });

    // POST /api/products/import - Import products CSV file
    CROW_ROUTE(app, "/api/products/import").methods("POST"_method)([](const crow::request& req) {
        return importProducts(req);
    });

    // GET /api/products/export - Export products data as CSV
    CROW_ROUTE(app, "/api/products/export").methods("GET"_method)([]() {
        return exportProducts();
    });

    // GET /api/products/<string> - Get single product by ID (string UUID)
    CROW_ROUTE(app, "/api/products/<string>").methods("GET"_method)([](const crow::request& req, const std::string& id) {
        return getProductById(req, id);
    });

    // Categories route
    CROW_ROUTE(app, "/api/products/categories").methods("GET"_method)([]() {
        auto categories = getAllCategoriesFromDB();
        crow::json::wvalue result;
        size_t i = 0;
        for (const auto& cat : categories) {
            result[i++] = cat;
        }
        return crow::response{result};
    });


    // PUT /api/products/<string> - Update product by ID
    CROW_ROUTE(app, "/api/products/<string>").methods("PUT"_method)([](const crow::request& req, const std::string& id) {
        return updateProduct(req, id);
    });

    // DELETE /api/products/<string> - Delete product by ID
    CROW_ROUTE(app, "/api/products/<string>").methods("DELETE"_method)([](const std::string& id) {
        return deleteProduct(id);
    });

    // GET /api/products/search?q=... - Search products
    CROW_ROUTE(app, "/api/products/search").methods("GET"_method)([](const crow::request& req) {
        auto query = req.url_params.get("q");
        if (!query) {
            return crow::response(400, "Missing search query");
        }
        auto results = searchProducts(query);
        auto json = serializeProductsToJson(results);
        return crow::response{json};
    });


    // GET /api/products/scan?barcode=... - Scan product by barcode
    CROW_ROUTE(app, "/api/products/scan").methods("GET"_method)([](const crow::request& req) {
        return scanProductByBarcode(req);
    });

    // OPTIONS handlers for CORS preflight

    CROW_ROUTE(app, "/api/products").methods("OPTIONS"_method)([](const crow::request&, crow::response& res) {
        res.code = 204;
        res.end();
    });

    CROW_ROUTE(app, "/api/products/categories").methods("OPTIONS"_method)([](const crow::request&, crow::response& res) {
        res.code = 204;
        res.end();
    });

    CROW_ROUTE(app, "/api/products/<string>").methods("OPTIONS"_method)([](const crow::request&, crow::response& res, const std::string&) {
        res.code = 204;
        res.end();
    });

    CROW_ROUTE(app, "/api/products/search").methods("OPTIONS"_method)([](const crow::request&, crow::response& res) {
        res.code = 204;
        res.end();
    });

    CROW_ROUTE(app, "/api/products/scan").methods("OPTIONS"_method)([](const crow::request&, crow::response& res) {
        res.code = 204;
        res.end();
    });

    // OPTIONS handler for preflight CORS
    CROW_ROUTE(app, "/api/products/import").methods("OPTIONS"_method)([](const crow::request&, crow::response& res) {
        res.code = 204;
        res.end();
    });

    // OPTIONS handler for CORS preflight
    CROW_ROUTE(app, "/api/products/export").methods("OPTIONS"_method)([](const crow::request&, crow::response& res) {
        res.code = 204;
        res.end();
    });
}

template void setupProductRoutes<crow::App<CORSHandler>>(crow::App<CORSHandler>&);
