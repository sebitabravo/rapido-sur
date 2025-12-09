"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-xl font-semibold">Página no encontrada</h2>
          <p className="text-muted-foreground">
            La página que está buscando no existe o ha sido movida.
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  )
}
