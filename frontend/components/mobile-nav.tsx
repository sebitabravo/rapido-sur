"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Truck, Wrench, AlertTriangle, BarChart3, Users, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, hasRole } = useAuth()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/vehicles", label: "Vehículos", icon: Truck },
    { href: "/work-orders", label: "Órdenes de Trabajo", icon: Wrench },
    { href: "/alerts", label: "Alertas", icon: AlertTriangle },
    { href: "/reports", label: "Reportes", icon: BarChart3 },
  ]

  if (hasRole("ADMIN")) {
    navItems.push({ href: "/users", label: "Usuarios", icon: Users })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Rápido Sur</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          {user && (
            <div className="pb-4 border-b">
              <p className="font-medium">{user.nombre}</p>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
          )}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", isActive && "bg-secondary")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
          <div className="pt-4 border-t mt-auto">
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
