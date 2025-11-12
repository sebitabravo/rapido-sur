"use client"

import { useEffect, useState } from "react"
import { authService } from "@/lib/auth"

export function AuthInitializer() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize auth service immediately - clears old incompatible data
    if (typeof window !== "undefined") {
      authService.init()
      setIsInitialized(true)
    }
  }, [])

  // Perform cleanup synchronously during component mount
  if (typeof window !== "undefined" && !isInitialized) {
    authService.init()
  }

  return null
}
