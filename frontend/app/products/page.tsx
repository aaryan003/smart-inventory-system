"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, ScanLine, Download, Upload, Package } from "lucide-react"
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
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  price: number
  stock: number
  description: string
  status: "in-stock" | "low-stock" | "out-of-stock"
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false)
  const [scannedCode, setScannedCode] = useState("")

  // Sample data
  useEffect(() => {
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "Wireless Headphones",
        sku: "WH-001",
        barcode: "1234567890123",
        category: "Electronics",
        price: 99.99,
        stock: 25,
        description: "High-quality wireless headphones with noise cancellation",
        status: "in-stock",
      },
      {
        id: "2",
        name: "Coffee Mug",
        sku: "CM-002",
        barcode: "2345678901234",
        category: "Kitchen",
        price: 12.99,
        stock: 5,
        description: "Ceramic coffee mug with ergonomic handle",
        status: "low-stock",
      },
      {
        id: "3",
        name: "Notebook",
        sku: "NB-003",
        barcode: "3456789012345",
        category: "Office",
        price: 8.99,
        stock: 0,
        description: "A5 lined notebook with hardcover",
        status: "out-of-stock",
      },
    ]
    setProducts(sampleProducts)
  }, [])

  const handleAddProduct = (formData: FormData) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      barcode: formData.get("barcode") as string,
      category: formData.get("category") as string,
      price: Number.parseFloat(formData.get("price") as string),
      stock: Number.parseInt(formData.get("stock") as string),
      description: formData.get("description") as string,
      status:
        Number.parseInt(formData.get("stock") as string) > 10
          ? "in-stock"
          : Number.parseInt(formData.get("stock") as string) > 0
            ? "low-stock"
            : "out-of-stock",
    }

    setProducts([...products, newProduct])
    setIsAddDialogOpen(false)
    toast.success("Product Added", {
      description: `${newProduct.name} has been added to inventory.`,
    })
  }

  const handleScanBarcode = () => {
    // Simulate barcode scanning
    const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000
    setScannedCode(randomBarcode.toString())

    // Check if product exists
    const existingProduct = products.find((p) => p.barcode === randomBarcode.toString())
    if (existingProduct) {
      toast.success("Product Found", {
        description: `Found: ${existingProduct.name} (${existingProduct.sku})`,
      })
    } else {
      toast.error("Product Not Found", {
        description: "This barcode is not in the system. Consider adding it as a new product.",
      })
    }
  }

  const filteredAndSortedProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm),
    )
    .filter((product) => filterCategory === "all" || product.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price":
          return a.price - b.price
        case "stock":
          return b.stock - a.stock
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

  const categories = [...new Set(products.map((p) => p.category))]

  const saveData = () => {
    const dataStr = JSON.stringify(products, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "inventory-products.json"
    link.click()
    toast.success("Data Saved", {
      description: "Product data has been exported successfully.",
    })
  }

  const loadData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          setProducts(data)
          toast.success("Data Loaded", {
            description: "Product data has been imported successfully.",
          })
        } catch (error) {
          toast.error("Error", {
            description: "Failed to load data. Please check the file format.",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Save Data
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Load Data
              </span>
            </Button>
            <input type="file" accept=".json" onChange={loadData} className="hidden" />
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
                <DialogDescription>Simulate scanning a barcode to find products</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <ScanLine className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Click to simulate barcode scan</p>
                  <Button onClick={handleScanBarcode}>Simulate Scan</Button>
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
                <DialogDescription>Enter the details for the new product</DialogDescription>
              </DialogHeader>
              <form action={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" required />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input id="barcode" name="barcode" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" required />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" name="stock" type="number" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit" className="w-full">
                  Add Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map((product) => (
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
                {product.description && <p className="text-sm text-gray-600 mt-2">{product.description}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first product"}
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
