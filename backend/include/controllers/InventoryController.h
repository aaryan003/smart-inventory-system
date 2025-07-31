#ifndef INVENTORY_CONTROLLER_H
#define INVENTORY_CONTROLLER_H

#include <crow.h>

crow::response getInventoryOverview();

// Handles PATCH /api/inventory/stock/{id}
crow::response updateStock(const crow::request& req, int id);

// Handles GET /api/inventory/alerts
crow::response getAlerts();

// Handles DELETE /api/inventory/alerts/{id}
crow::response deleteAlert(int id);

// Handles POST /api/inventory/export
crow::response exportInventory();

// Handles POST /api/inventory/import
crow::response importInventory();

#endif // INVENTORY_CONTROLLER_H
