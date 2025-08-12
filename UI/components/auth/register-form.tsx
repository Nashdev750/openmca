"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowRight } from "lucide-react"
import { authApi, AuthApiError } from "@/lib/auth-api"

interface RegisterFormProps {
  onSubmit: (email: string, phone: string) => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSubmit, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !phone.trim()) return

    setIsLoading(true)
    setError("")

    try {
      await authApi.sendOtp({ phone, email })
      onSubmit(email, phone)
    } catch (error) {
      if (error instanceof AuthApiError) {
        setError(error.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
      console.error("Failed to send OTP:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-12 h-12 bg-cyan-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Secure access to your financial tools</p>
        </div>

        {/* Register Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Get Started</CardTitle>
            <CardDescription>Enter your details to create your secure account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base border-gray-200 focus:border-cyan-600 focus:ring-cyan-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 text-base border-gray-200 focus:border-cyan-600 focus:ring-cyan-600"
                  required
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

              <Button
                type="submit"
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={onSwitchToLogin}
                  className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
