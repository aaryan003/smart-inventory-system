#include "crow.h"
#include "middleware/CorsMiddleware.h"
#include "routes/products_routes.h"
#include "routes/inventory_routes.h"
#include "db/Database.h"

int main() {
    std::string dbPath = std::filesystem::current_path().parent_path().string() + "/data/inventory.db";
    if (!Database::init(dbPath)) {
        std::cerr << "Failed to connect to database!" << std::endl;
        return 1;
    }

    crow::App<CORSHandler> app;

    setupProductRoutes(app);
    setupInventoryRoutes(app);

    CROW_ROUTE(app, "/api/health").methods("GET"_method)([]() {
        crow::json::wvalue result;
        result["status"] = "ok";
        result["timestamp"] = std::time(nullptr);
        return crow::response{result};
    });

    CROW_ROUTE(app, "/api/test").methods("GET"_method, "OPTIONS"_method)([](){
    return "Hello from test!";
});


    app.port(8080).multithreaded().run();
}
