import Link from "next/link"
import { Package, Warehouse, BarChart3, Plus, Search, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">InventoryPro</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your inventory management with our comprehensive solution. Track products, manage stock levels,
            and optimize your operations.
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Link href="/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Product Management</CardTitle>
                <CardDescription className="text-base">
                  Add new products, scan barcodes, search and manage your product catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Add Products</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Barcode Scan</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Search & Sort</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <Warehouse className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Inventory Overview</CardTitle>
                <CardDescription className="text-base">
                  View stock levels, manage alerts, and monitor your inventory status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Stock Levels</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Alerts</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Analytics</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/products?action=add">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full bg-transparent">
                <Plus className="h-6 w-6" />
                <span className="text-sm">Add Product</span>
              </Button>
            </Link>
            <Link href="/products?action=scan">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full bg-transparent">
                <ScanLine className="h-6 w-6" />
                <span className="text-sm">Scan Barcode</span>
              </Button>
            </Link>
            <Link href="/products?action=search">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full bg-transparent">
                <Search className="h-6 w-6" />
                <span className="text-sm">Search Products</span>
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full bg-transparent">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">View Reports</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">System Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <ScanLine className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Barcode Scanning</h3>
              <p className="text-gray-600 text-sm">
                Simulate barcode scanning for quick product identification and management
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Alerts</h3>
              <p className="text-gray-600 text-sm">Get notified about low stock levels and inventory issues</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit">
                <Package className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold mb-2">Data Management</h3>
              <p className="text-gray-600 text-sm">Save and load inventory data with comprehensive backup options</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
