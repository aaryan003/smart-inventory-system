#include "controllers/InventoryController.h"
#include "models/InventoryModel.h"
#include <fstream>
#include <crow.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

crow::response getInventoryOverview() {
    try {
        auto inventory = InventoryModel::fetchInventoryOverview();
        json jsonData = json::array();

        for (const auto& product : inventory) {
            jsonData.push_back({
                {"id", product.id},
                {"name", product.name},
                {"barcode", product.barcode},
                {"quantity", product.stock},
                {"threshold", product.threshold},
                {"status", product.status}
            });
        }

        return crow::response(200, jsonData.dump());
    } catch (const std::exception& e) {
        return crow::response(500, std::string("Error retrieving inventory: ") + e.what());
    }
}

crow::response updateStock(const crow::request& req, int id) {
    auto body = crow::json::load(req.body);
    if (!body || !body.has("stock")) {
        return crow::response(400, "Missing 'stock' field");
    }

    int stock = body["stock"].i();
    if (InventoryModel::updateStockQuantity(id, stock)) {
        return crow::response(200);
    }

    return crow::response(500, "Failed to update stock");
}

crow::response getAlerts() {
    try {
        auto alerts = InventoryModel::fetchInventoryAlerts();
        crow::json::wvalue json;

        for (size_t i = 0; i < alerts.size(); ++i) {
            json["alerts"][i]["id"] = alerts[i].id;
            json["alerts"][i]["product_id"] = alerts[i].productId;
            json["alerts"][i]["message"] = alerts[i].message;
            json["alerts"][i]["created_at"] = alerts[i].createdAt;
        }

        return crow::response{json};
    } catch (const std::exception& e) {
        return crow::response(500, std::string("Error fetching alerts: ") + e.what());
    }
}

crow::response deleteAlert(int id) {
    if (InventoryModel::deleteInventoryAlert(id)) {
        return crow::response(200);
    }
    return crow::response(500, "Failed to delete alert");
}

crow::response exportInventory() {
    if (InventoryModel::exportCSV("inventory_export.csv")) {
        return crow::response(200);
    }
    return crow::response(500, "CSV export failed");
}

crow::response importInventory() {
    if (InventoryModel::importCSV("inventory_export.csv")) {
        return crow::response(200);
    }
    return crow::response(500, "CSV import failed");
}
