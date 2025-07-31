#ifndef INVENTORY_MODEL_H
#define INVENTORY_MODEL_H

#include <vector>
#include <string>
#include "models/ProductModel.h"

struct InventoryAlert {
    int id;
    int productId;     // Use camelCase consistently
    std::string message;
    int threshold;
    std::string createdAt;
};

namespace InventoryModel {
    std::vector<Product> fetchInventoryOverview();
    std::vector<InventoryAlert> fetchInventoryAlerts();
    bool deleteInventoryAlert(int alertId);
    bool updateStockQuantity(int productId, int newQuantity);
    bool importCSV(const std::string& filePath);
    bool exportCSV(const std::string& filePath);
}

#endif
