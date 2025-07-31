#include "routes/inventory_routes.h"
#include "controllers/InventoryController.h"
#include "middleware/CorsMiddleware.h"

template <typename App>
void setupInventoryRoutes(App& app) {
    CROW_ROUTE(app, "/api/inventory").methods("GET"_method)([]() {
        return getInventoryOverview();
    });
    CROW_ROUTE(app, "/api/inventory/stock/<int>").methods("PATCH"_method)([](const crow::request& req, int id) {
        return updateStock(req, id);
    });
    CROW_ROUTE(app, "/api/inventory/alerts").methods("GET"_method)([]() {
        return getAlerts();
    });
    CROW_ROUTE(app, "/api/inventory/alerts/<int>").methods("DELETE"_method)([](int id) {
        return deleteAlert(id);
    });
    CROW_ROUTE(app, "/api/inventory/export").methods("POST"_method)([]() {
        return exportInventory();
    });
    CROW_ROUTE(app, "/api/inventory/import").methods("POST"_method)([]() {
        return importInventory();
    });

    // Explicit OPTIONS handlers:
    CROW_ROUTE(app, "/api/inventory").methods("OPTIONS"_method)
    ([](const crow::request&, crow::response& res) { res.code = 204; res.end(); });

    // For /stock/<int>
    CROW_ROUTE(app, "/api/inventory/stock/<int>").methods("OPTIONS"_method)
    ([](const crow::request&, crow::response& res, int) { res.code = 204; res.end(); });

    // For /alerts (no param)
    CROW_ROUTE(app, "/api/inventory/alerts").methods("OPTIONS"_method)
    ([](const crow::request&, crow::response& res) { res.code = 204; res.end(); });

    // For /alerts/<int>
    CROW_ROUTE(app, "/api/inventory/alerts/<int>").methods("OPTIONS"_method)
    ([](const crow::request&, crow::response& res, int) { res.code = 204; res.end(); });

    CROW_ROUTE(app, "/api/inventory/export").methods("OPTIONS"_method)
    ([](const crow::request&, crow::response& res) { res.code = 204; res.end(); });

    CROW_ROUTE(app, "/api/inventory/import").methods("OPTIONS"_method)
    ([](const crow::request&, crow::response& res) { res.code = 204; res.end(); });
}

template void setupInventoryRoutes<crow::App<CORSHandler>>(crow::App<CORSHandler>&);
