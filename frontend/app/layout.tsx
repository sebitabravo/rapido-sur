import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/error-boundary"
import { OfflineIndicator } from "@/components/offline-indicator"
import { AuthInitializer } from "@/components/auth-initializer"
import { WebSocketNotifications } from "@/components/websocket-notifications"

export const metadata: Metadata = {
  title: "Rápido Sur - Sistema de Gestión de Mantenimiento",
  description: "Sistema integral de gestión de mantenimiento de flota vehicular",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthInitializer />
        <WebSocketNotifications />
        <ErrorBoundary>
          {children}
          <OfflineIndicator />
        </ErrorBoundary>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
