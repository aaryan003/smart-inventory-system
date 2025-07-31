"use client"

import { useState, useEffect, useCallback } from "react"
import { inventoryApi, type InventoryItem, type InventoryAlert } from "@/lib/api"
import { toast } from "sonner"

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalItems: 0,
    lowStockItems: 0,
    categories: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch inventory overview
  const fetchInventory = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await inventoryApi.getOverview()

      if (response.success && response.data) {
        setInventory(response.data.items)
        setSummary(response.data.summary)
      } else {
        setError(response.error || "Failed to fetch inventory")
        toast.error("Error", {
          description: response.error || "Failed to fetch inventory",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      toast.error("Network Error", {
        description: "Unable to connect to the server. Please check if the backend is running.",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await inventoryApi.getAlerts()

      if (response.success && response.data) {
        setAlerts(response.data)
      } else {
        console.error("Failed to fetch alerts:", response.error)
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err)
    }
  }, [])

  // Dismiss alert
  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const response = await inventoryApi.dismissAlert(alertId)

      if (response.success) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
        toast.success("Alert Dismissed", {
          description: "The alert has been removed from your dashboard.",
        })
      } else {
        toast.error("Error", {
          description: response.error || "Failed to dismiss alert",
        })
      }
    } catch (err) {
      toast.error("Error", {
        description: "Failed to dismiss alert. Please try again.",
      })
    }
  }, [])

  // Export inventory report
  const exportReport = useCallback(async () => {
    try {
      const response = await inventoryApi.exportData()

      if (response.success && response.data) {
        const url = URL.createObjectURL(response.data as Blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `inventory-report-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success("Report Exported", {
          description: "Inventory report has been downloaded successfully.",
        })
      } else {
        toast.error("Export Failed", {
          description: response.error || "Failed to export report",
        })
      }
    } catch (err) {
      toast.error("Export Error", {
        description: "Failed to export report. Please try again.",
      })
    }
  }, [])

  // Update stock levels
  const updateStock = useCallback(
    async (productId: string, quantity: number, operation: "add" | "subtract" | "set") => {
      try {
        const response = await inventoryApi.updateStock(productId, quantity, operation)

        if (response.success && response.data) {
          setInventory((prev) => prev.map((item) => (item.id === productId ? response.data! : item)))

          // Recalculate summary
          const updatedItem = response.data
          setSummary((prev) => ({
            ...prev,
            totalValue: prev.totalValue - (inventory.find((i) => i.id === productId)?.value || 0) + updatedItem.value,
            totalItems:
              prev.totalItems -
              (inventory.find((i) => i.id === productId)?.currentStock || 0) +
              updatedItem.currentStock,
          }))

          toast.success("Stock Updated", {
            description: "Stock levels have been updated successfully.",
          })

          // Refresh alerts as stock change might affect them
          fetchAlerts()

          return response.data
        } else {
          toast.error("Error", {
            description: response.error || "Failed to update stock",
          })
          throw new Error(response.error)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update stock"
        toast.error("Error", {
          description: errorMessage,
        })
        throw err
      }
    },
    [inventory, fetchAlerts],
  )

  // Import inventory data
  const importData = useCallback(
    async (file: File) => {
      try {
        const response = await inventoryApi.importData(file)

        if (response.ok) {
          await fetchInventory()
          await fetchAlerts()
          toast.success("Data Imported", {
            description: "Inventory data has been imported successfully.",
          })
        } else {
          const errorData = await response.json()
          toast.error("Import Failed", {
            description: errorData.message || "Failed to import data",
          })
        }
      } catch (err) {
        toast.error("Import Error", {
          description: "Failed to import data. Please check the file format.",
        })
      }
    },
    [fetchInventory, fetchAlerts],
  )

  // Initial load
  useEffect(() => {
    fetchInventory()
    fetchAlerts()
  }, [fetchInventory, fetchAlerts])

  return {
    inventory,
    alerts,
    summary,
    loading,
    error,
    fetchInventory,
    fetchAlerts,
    dismissAlert,
    exportReport,
    updateStock,
    importData,
    refetch: () => {
      fetchInventory()
      fetchAlerts()
    },
  }
}
