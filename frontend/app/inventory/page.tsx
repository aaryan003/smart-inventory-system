"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Package, DollarSign, BarChart3, Download, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert as UIAlert, AlertDescription as UIDescription, AlertTitle as UITitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  price: number
  value: number
  lastUpdated: string
  status: "healthy" | "low" | "critical" | "overstock"
}

interface InventoryAlert {
  id: string
  type: "low-stock" | "out-of-stock" | "overstock"
  message: string
  productId: string
  severity: "high" | "medium" | "low"
  timestamp: string
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])

  // Sample data
  useEffect(() => {
    const sampleInventory: InventoryItem[] = [
      {
        id: "1",
        name: "Wireless Headphones",
        sku: "WH-001",
        category: "Electronics",
        currentStock: 25,
        minStock: 10,
        maxStock: 100,
        price: 99.99,
        value: 2499.75,
        lastUpdated: "2024-01-15",
        status: "healthy",
      },
      {
        id: "2",
        name: "Coffee Mug",
        sku: "CM-002",
        category: "Kitchen",
        currentStock: 5,
        minStock: 15,
        maxStock: 50,
        price: 12.99,
        value: 64.95,
        lastUpdated: "2024-01-14",
        status: "low",
      },
      {
        id: "3",
        name: "Notebook",
        sku: "NB-003",
        category: "Office",
        currentStock: 0,
        minStock: 20,
        maxStock: 200,
        price: 8.99,
        value: 0,
        lastUpdated: "2024-01-13",
        status: "critical",
      },
      {
        id: "4",
        name: "USB Cable",
        sku: "UC-004",
        category: "Electronics",
        currentStock: 150,
        minStock: 30,
        maxStock: 100,
        price: 15.99,
        value: 2398.5,
        lastUpdated: "2024-01-15",
        status: "overstock",
      },
    ]

    const sampleAlerts: InventoryAlert[] = [
      {
        id: "1",
        type: "low-stock",
        message: "Coffee Mug (CM-002) is running low. Current stock: 5 units",
        productId: "2",
        severity: "medium",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        type: "out-of-stock",
        message: "Notebook (NB-003) is out of stock",
        productId: "3",
        severity: "high",
        timestamp: "2024-01-15T09:15:00Z",
      },
      {
        id: "3",
        type: "overstock",
        message: "USB Cable (UC-004) is overstocked. Consider reducing orders",
        productId: "4",
        severity: "low",
        timestamp: "2024-01-15T08:00:00Z",
      },
    ]

    setInventory(sampleInventory)
    setAlerts(sampleAlerts)
  }, [])

  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0)
  const totalItems = inventory.reduce((sum, item) => sum + item.currentStock, 0)
  const lowStockItems = inventory.filter((item) => item.status === "low" || item.status === "critical").length
  const categories = [...new Set(inventory.map((item) => item.category))]

  const getStockPercentage = (current: number, min: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "low":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      case "overstock":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const exportInventoryReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalValue,
        totalItems,
        lowStockItems,
        categories: categories.length,
      },
      inventory,
      alerts,
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `inventory-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    toast.success("Report Exported", {
      description: "Inventory report has been downloaded successfully.",
    })
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
    toast.success("Alert Dismissed", {
      description: "The alert has been removed from your dashboard.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Overview</h1>
          <p className="text-gray-600 mt-2">Monitor stock levels and manage your inventory</p>
        </div>
        <Button onClick={exportInventoryReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-4">
            {inventory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>
                        SKU: {item.sku} • Category: {item.category}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        item.status === "healthy"
                          ? "default"
                          : item.status === "low"
                            ? "secondary"
                            : item.status === "critical"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Stock</p>
                      <p className={`text-2xl font-bold ${getStatusColor(item.status)}`}>{item.currentStock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock Range</p>
                      <p className="text-sm">
                        Min: {item.minStock} • Max: {item.maxStock}
                      </p>
                      <Progress
                        value={getStockPercentage(item.currentStock, item.minStock, item.maxStock)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit Price</p>
                      <p className="text-lg font-semibold">${item.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-lg font-semibold">${item.value.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-600">Your inventory is running smoothly!</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <UIAlert
                key={alert.id}
                className={
                  alert.severity === "high"
                    ? "border-red-200 bg-red-50"
                    : alert.severity === "medium"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }
              >
                <AlertTriangle className="h-4 w-4" />
                <UITitle className="flex items-center justify-between">
                  <span>
                    {alert.type === "low-stock"
                      ? "Low Stock Alert"
                      : alert.type === "out-of-stock"
                        ? "Out of Stock Alert"
                        : "Overstock Alert"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                      Dismiss
                    </Button>
                  </div>
                </UITitle>
                <UIDescription>
                  {alert.message}
                  <br />
                  <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</span>
                </UIDescription>
              </UIAlert>
            ))
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["healthy", "low", "critical", "overstock"].map((status) => {
                    const count = inventory.filter((item) => item.status === status).length
                    const percentage = (count / inventory.length) * 100
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm w-12">{count} items</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryItems = inventory.filter((item) => item.category === category)
                    const categoryValue = categoryItems.reduce((sum, item) => sum + item.value, 0)
                    const percentage = (categoryValue / totalValue) * 100
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span>{category}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm w-16">${categoryValue.toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
