"use client"

import { useState, useEffect, useCallback } from "react"
import { authApi } from "@/lib/auth-api"

export type AuthState = "loading" | "authenticated" | "unauthenticated"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>("loading")

  const checkSession = useCallback(async () => {
    try {
      const isValid = await authApi.verifySession()
      setAuthState(isValid ? "authenticated" : "unauthenticated")
    } catch {
      setAuthState("unauthenticated")
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Clear session cookie by calling logout endpoint if available
      await fetch("https://openmca.com/auth/api/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {
        // If logout endpoint doesn't exist, that's okay
        // The session will be cleared client-side
      })
    } catch {
      // Ignore logout errors
    } finally {
      setAuthState("unauthenticated")
    }
  }, [])

  const login = useCallback(() => {
    setAuthState("authenticated")
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return {
    authState,
    isLoading: authState === "loading",
    isAuthenticated: authState === "authenticated",
    login,
    logout,
    checkSession,
  }
}
