"use client"

import { useState, useEffect } from "react"
import { RegisterForm } from "@/components/auth/register-form"
import { LoginForm } from "@/components/auth/login-form"
import { OtpVerification } from "@/components/auth/otp-verification"
import { Dashboard } from "@/components/dashboard"
import { LoadingScreen } from "@/components/loading-screen"
import { useAuth } from "@/hooks/use-auth"

type AuthStep = "login" | "register" | "otp"

export default function HomePage() {
  const { authState, isAuthenticated, login, logout } = useAuth()
  const [currentStep, setCurrentStep] = useState<AuthStep>("login")
  const [userPhone, setUserPhone] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      // Reset auth flow state when already authenticated
      setCurrentStep("login")
      setUserPhone("")
      setUserEmail("")
    }
  }, [isAuthenticated])

  const handleLoginSubmit = (phone: string) => {
    setUserPhone(phone)
    setCurrentStep("otp")
  }

  const handleRegisterSubmit = (email: string, phone: string) => {
    setUserEmail(email)
    setUserPhone(phone)
    setCurrentStep("otp")
  }

  const handleOtpSuccess = () => {
    login() // Update auth state
  }

  const handleBackToAuth = () => {
    setCurrentStep("login")
    setUserPhone("")
    setUserEmail("")
  }

  const handleLogout = () => {
    logout()
    handleBackToAuth()
  }

  if (authState === "loading") {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "login" && (
        <LoginForm onSubmit={handleLoginSubmit} onSwitchToRegister={() => setCurrentStep("register")} />
      )}

      {currentStep === "register" && (
        <RegisterForm onSubmit={handleRegisterSubmit} onSwitchToLogin={() => setCurrentStep("login")} />
      )}

      {currentStep === "otp" && (
        <OtpVerification phone={userPhone} onSuccess={handleOtpSuccess} onBack={handleBackToAuth} />
      )}
    </div>
  )
}
