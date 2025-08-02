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

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  expectBlob: boolean = false
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(expectBlob ? {} : { "Content-Type": "application/json", Accept: "application/json" }),
      },
      mode: "cors",
      credentials: "omit",
    })

    const contentType = response.headers.get("content-type")
    let data: any

    if (expectBlob) {
      data = await response.blob()
    } else if (contentType?.includes("application/json")) {
      data = await response.json()
    } else if (contentType?.includes("text/")) {
      const text = await response.text()
      data = { message: text }
    } else {
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

  getById: async (id: string) => {
    return apiCall<Product>(`/products/${id}`)
  },

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

  update: async (id: string, product: Partial<Product>) => {
    return apiCall<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  },

  delete: async (id: string) => {
    return apiCall<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    })
  },

  search: async (query: string) => {
    return apiCall<Product[]>(`/products/search?q=${encodeURIComponent(query)}`)
  },

  scanBarcode: async (barcode: string) => {
    return apiCall<Product>(`/products/scan/${barcode}`)
  },

  getCategories: async () => {
    return apiCall<string[]>("/products/categories")
  },

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

  exportData: async () => {
    return apiCall<Blob>("/products/export", { method: "GET" }, true)
  },
}

// Inventory API functions
export const inventoryApi = {
  getOverview: async () => {
    return apiCall<InventoryOverview>("/inventory")
  },

  getAlerts: async () => {
    return apiCall<InventoryAlert[]>("/inventory/alerts")
  },

  dismissAlert: async (alertId: string) => {
    return apiCall<{ message: string }>(`/inventory/alerts/${alertId}`, {
      method: "DELETE",
    })
  },

  exportData: async () => {
    return apiCall<Blob>("/inventory/export", { method: "POST" }, true)
  },

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

  updateStock: async (productId: string, quantity: number, operation: "add" | "subtract" | "set") => {
    return apiCall<InventoryItem>(`/inventory/stock/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity, operation }),
    })
  },

  getLowStock: async () => {
    return apiCall<Product[]>("/inventory/low-stock")
  },

  getOutOfStock: async () => {
    return apiCall<Product[]>("/inventory/out-of-stock")
  },
}

// Health check function
export const healthCheck = async () => {
  return apiCall<{ status: string; timestamp: string }>("/health")
}
