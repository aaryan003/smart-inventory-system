"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, ScanLine, Download, Upload, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProducts } from "@/hooks/useProducts"
import { ConnectionStatus } from "@/components/connection-status"

export default function ProductsPage() {
  const { products, categories, loading, addProduct, scanBarcode, fetchProducts, exportData, importData } =
    useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false)
  const [scannedCode, setScannedCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle search and filtering with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProducts({
        search: searchTerm || undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
        sortBy: sortBy,
        sortOrder: "asc",
      })
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, filterCategory, sortBy, fetchProducts])

  const handleAddProduct = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const productData = {
        name: formData.get("name") as string,
        sku: formData.get("sku") as string,
        barcode: formData.get("barcode") as string,
        category: formData.get("category") as string,
        price: Number.parseFloat(formData.get("price") as string),
        stock: Number.parseInt(formData.get("stock") as string),
        description: (formData.get("description") as string) || "",
      }

      await addProduct(productData)
      setIsAddDialogOpen(false)

      // Reset form
      const form = document.querySelector("form") as HTMLFormElement
      if (form) form.reset()
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScanBarcode = async () => {
    // In a real app, this would use camera API
    // For now, we'll simulate with a random barcode or let user input
    const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000
    setScannedCode(randomBarcode.toString())

    const result = await scanBarcode(randomBarcode.toString())
    if (result) {
      setIsScanDialogOpen(false)
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await importData(file)
      // Reset file input
      event.target.value = ""
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ConnectionStatus />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading products from database...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ConnectionStatus />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog • {products.length} products in database</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <label>
            <Button variant="outline" asChild disabled={loading}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </span>
            </Button>
            <input type="file" accept=".json,.csv" onChange={handleFileImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="created_at">Date Added</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ScanLine className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Barcode Scanner</DialogTitle>
                <DialogDescription>Scan or simulate a barcode to find products in database</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <ScanLine className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Click to simulate barcode scan</p>
                  <Button onClick={handleScanBarcode}>Simulate Scan</Button>
                </div>
                <div>
                  <Label htmlFor="manual-barcode">Or enter barcode manually:</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="manual-barcode"
                      placeholder="Enter barcode..."
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                    />
                    <Button onClick={() => scanBarcode(scannedCode)} disabled={!scannedCode}>
                      Search
                    </Button>
                  </div>
                </div>
                {scannedCode && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">Scanned Code:</p>
                    <p className="font-mono text-lg">{scannedCode}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Enter product details to add to database</DialogDescription>
              </DialogHeader>
              <form action={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" name="name" required disabled={isSubmitting} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input id="sku" name="sku" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode *</Label>
                    <Input id="barcode" name="barcode" required disabled={isSubmitting} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input id="category" name="category" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input id="price" name="price" type="number" step="0.01" min="0" required disabled={isSubmitting} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input id="stock" name="stock" type="number" min="0" required disabled={isSubmitting} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    disabled={isSubmitting}
                    placeholder="Optional product description..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Product...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Grid */}
      {loading && products.length > 0 && (
        <div className="text-center mb-4">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
          <span className="text-sm text-gray-600">Updating products...</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>SKU: {product.sku}</CardDescription>
                </div>
                <Badge
                  variant={
                    product.status === "in-stock"
                      ? "default"
                      : product.status === "low-stock"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {product.status.replace("-", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span
                    className={`text-sm font-medium ${
                      product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-yellow-600" : "text-green-600"
                    }`}
                  >
                    {product.stock} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Barcode:</span>
                  <span className="text-sm font-mono">{product.barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Added:</span>
                  <span className="text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first product to the database"}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}
    </div>
  )
}
