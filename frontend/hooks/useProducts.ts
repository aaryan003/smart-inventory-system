"use client"

import { useState, useEffect, useCallback } from "react"
import { productApi, type Product } from "@/lib/api"
import { toast } from "sonner"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch products with filters
  const fetchProducts = useCallback(
    async (params?: {
      search?: string
      category?: string
      sortBy?: string
      sortOrder?: "asc" | "desc"
      limit?: number
      offset?: number
    }) => {
      setLoading(true)
      setError(null)

      try {
        const response = await productApi.getAll(params)

        if (response.success && response.data) {
          setProducts(response.data)
          setTotalCount(response.data.length)
        } else {
          setError(response.error || "Failed to fetch products")
          toast.error("Error", {
            description: response.error || "Failed to fetch products",
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
    },
    [],
  )

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await productApi.getCategories()
      if (response.success && response.data) {
        setCategories(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }, [])

  // Add new product
  const addProduct = useCallback(
    async (productData: {
      name: string
      sku: string
      barcode: string
      category: string
      price: number
      stock: number
      description?: string
    }) => {
      try {
        // Add a default threshold before sending:
        const productWithThreshold = {
        ...productData,
        threshold: 5,  // Default value; adjust as needed or make it user input
      }

      const response = await productApi.create(productWithThreshold)

        if (response.success && response.data) {
          setProducts((prev) => [response.data!, ...prev])
          setTotalCount((prev) => prev + 1)
          toast.success("Product Added", {
            description: `${response.data.name} has been added to inventory.`,
          })

          // Refresh categories if new category was added
          if (!categories.includes(productData.category)) {
            fetchCategories()
          }

          return response.data
        } else {
          toast.error("Error", {
            description: response.error || "Failed to add product",
          })
          throw new Error(response.error)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add product"
        toast.error("Error", {
          description: errorMessage,
        })
        throw err
      }
    },
    [categories, fetchCategories],
  )

  // Update product
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const response = await productApi.update(id, updates)

      if (response.success && response.data) {
        setProducts((prev) => prev.map((p) => (p.id === id ? response.data! : p)))
        toast.success("Product Updated", {
          description: "Product has been updated successfully.",
        })
        return response.data
      } else {
        toast.error("Error", {
          description: response.error || "Failed to update product",
        })
        throw new Error(response.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update product"
      toast.error("Error", {
        description: errorMessage,
      })
      throw err
    }
  }, [])

  // Delete product
  const deleteProduct = useCallback(async (id: string) => {
    try {
      const response = await productApi.delete(id)

      if (response.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setTotalCount((prev) => prev - 1)
        toast.success("Product Deleted", {
          description: "Product has been removed from inventory.",
        })
      } else {
        toast.error("Error", {
          description: response.error || "Failed to delete product",
        })
        throw new Error(response.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product"
      toast.error("Error", {
        description: errorMessage,
      })
      throw err
    }
  }, [])

  // Scan barcode
  const scanBarcode = useCallback(async (barcode: string) => {
    try {
      const response = await productApi.scanBarcode(barcode)

      if (response.success && response.data) {
        toast.success("Product Found", {
          description: `Found: ${response.data.name} (${response.data.sku})`,
        })
        return response.data
      } else {
        toast.error("Product Not Found", {
          description: "This barcode is not in the system. Consider adding it as a new product.",
        })
        return null
      }
    } catch (err) {
      toast.error("Scan Error", {
        description: "Failed to scan barcode. Please try again.",
      })
      return null
    }
  }, [])

  // Export data
  const exportData = useCallback(async () => {
    try {
      const response = await productApi.exportData()

      if (response.success && response.data) {
        const url = URL.createObjectURL(response.data as Blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `products-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success("Data Exported", {
          description: "Product data has been exported successfully.",
        })
      } else {
        toast.error("Export Failed", {
          description: response.error || "Failed to export data",
        })
      }
    } catch (err) {
      toast.error("Export Error", {
        description: "Failed to export data. Please try again.",
      })
    }
  }, [])

  // Import data
  const importData = useCallback(
    async (file: File) => {
      try {
        const response = await productApi.importData(file)

        if (response.ok) {
          await fetchProducts()
          await fetchCategories()
          toast.success("Data Imported", {
            description: "Product data has been imported successfully.",
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
    [fetchProducts, fetchCategories],
  )

  // Initial load
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  return {
    products,
    categories,
    loading,
    error,
    totalCount,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    scanBarcode,
    exportData,
    importData,
    refetch: fetchProducts,
  }
}
