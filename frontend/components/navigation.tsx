"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Warehouse, Home, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/inventory", label: "Inventory", icon: Warehouse },
  ]

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            } ${mobile ? "w-full" : ""}`}
            onClick={() => mobile && setIsOpen(false)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
            <Package className="h-6 w-6 text-blue-600" />
            InventoryPro
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex items-center gap-2 mb-6">
                <Package className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-xl">InventoryPro</span>
              </div>
              <div className="flex flex-col gap-2">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
