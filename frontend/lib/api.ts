// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Types for API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  price: number
  stock: number
  description: string
  threshold: number
  status: "in-stock" | "low-stock" | "out-of-stock"
  created_at: string
  updated_at: string
}

export interface InventoryItem {
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

export interface InventoryAlert {
  id: string
  type: "low-stock" | "out-of-stock" | "overstock"
  message: string
  product_id: string
  severity: "high" | "medium" | "low"
  created_at: string
}

export interface InventoryOverview {
  items: InventoryItem[]
  summary: {
    totalValue: number
    totalItems: number
    lowStockItems: number
    categories: number
  }
}

// Generic API call function - REMOVED CORS headers (they belong on backend)
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Remove CORS headers - these should be set by your C++ backend
        ...options.headers,
      },
      // Keep these for proper CORS handling
      mode: "cors",
      credentials: "omit",
      ...options,
    })

    // Handle different response types
    const contentType = response.headers.get("content-type")
    let data: any

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else if (contentType && contentType.includes("text/")) {
      const text = await response.text()
      data = { message: text }
    } else {
      // For blob responses (file downloads)
      data = await response.blob()
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return {
      success: true,
      data: data,
      message: data.message,
    }
  } catch (error) {
    console.error("API call failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    }
  }
}

// Product API functions
export const productApi = {
  // Get all products with optional filters
  getAll: async (params?: {
    search?: string
    category?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    limit?: number
    offset?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append("search", params.search)
    if (params?.category && params.category !== "all") queryParams.append("category", params.category)
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy)
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.offset) queryParams.append("offset", params.offset.toString())

    const query = queryParams.toString()
    return apiCall<Product[]>(`/products${query ? `?${query}` : ""}`)
  },

  // Get single product
  getById: async (id: string) => {
    return apiCall<Product>(`/products/${id}`)
  },

  // Add new product
  create: async (product: {
    name: string
    sku: string
    barcode: string
    category: string
    price: number
    stock: number
    description?: string
    threshold: number
  }) => {
    return apiCall<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  },

  // Update product
  update: async (id: string, product: Partial<Product>) => {
    return apiCall<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  },

  // Delete product
  delete: async (id: string) => {
    return apiCall<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    })
  },

  // Search products
  search: async (query: string) => {
    return apiCall<Product[]>(`/products/search?q=${encodeURIComponent(query)}`)
  },

  // Scan barcode
  scanBarcode: async (barcode: string) => {
    return apiCall<Product>(`/products/scan/${barcode}`)
  },

  // Get categories
  getCategories: async () => {
    return apiCall<string[]>("/products/categories")
  },

  // Bulk import products
  importData: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return fetch(`${API_BASE_URL}/products/import`, {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "omit",
    })
  },

  // Export products
  exportData: async () => {
    return apiCall<Blob>("/products/export", {
      method: "GET",
    })
  },
}

// Inventory API functions
export const inventoryApi = {
  // Get inventory overview
  getOverview: async () => {
    return apiCall<InventoryOverview>("/inventory")
  },

  // Get alerts
  getAlerts: async () => {
    return apiCall<InventoryAlert[]>("/inventory/alerts")
  },

  // Dismiss alert
  dismissAlert: async (alertId: string) => {
    return apiCall<{ message: string }>(`/inventory/alerts/${alertId}`, {
      method: "DELETE",
    })
  },

  // Export inventory data
  exportData: async () => {
    return apiCall<Blob>("/inventory/export", {
      method: "POST",
    })
  },

  // Import inventory data
  importData: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return fetch(`${API_BASE_URL}/inventory/import`, {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "omit",
    })
  },

  // Update stock levels
  updateStock: async (productId: string, quantity: number, operation: "add" | "subtract" | "set") => {
    return apiCall<InventoryItem>(`/inventory/stock/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity, operation }),
    })
  },

  // Get low stock items
  getLowStock: async () => {
    return apiCall<Product[]>("/inventory/low-stock")
  },

  // Get out of stock items
  getOutOfStock: async () => {
    return apiCall<Product[]>("/inventory/out-of-stock")
  },
}

// Health check function
export const healthCheck = async () => {
  return apiCall<{ status: string; timestamp: string }>("/health")
}
