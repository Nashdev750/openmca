"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft, CheckCircle } from "lucide-react"
import { authApi, AuthApiError } from "@/lib/auth-api"

interface OtpVerificationProps {
  phone: string
  onSuccess: () => void
  onBack: () => void
}

export function OtpVerification({ phone, onSuccess, onBack }: OtpVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCountdown, setResendCountdown] = useState(30)
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && value) {
      handleVerifyOtp(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true)
    setError("")

    try {
      await authApi.verifyOtp({ phone, code: otpCode })
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      if (error instanceof AuthApiError) {
        if (error.status === 401 || error.status === 400) {
          setError("That code didn't match. Please try again.")
        } else {
          setError(error.message)
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      console.error("OTP verification failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await authApi.sendOtp({ phone })
      setResendCountdown(30)
    } catch (error) {
      console.error("Failed to resend OTP:", error)
    }
  }

  const maskedPhone = phone.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2")

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Access Granted</h1>
            <p className="text-gray-600">You're securely signed in</p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Identity</h1>
          <p className="text-gray-600">We've sent a one-time passcode to {maskedPhone}</p>
        </div>

        {/* OTP Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Enter Verification Code</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition-all ${
                    error ? "border-red-300 animate-shake" : "border-gray-200"
                  }`}
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center">
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              </div>
            )}

            {/* Resend Code */}
            <div className="text-center">
              {resendCountdown > 0 ? (
                <p className="text-sm text-gray-500">Resend code in {resendCountdown}s</p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium hover:underline"
                >
                  Resend verification code
                </button>
              )}
            </div>

            {/* Back Button */}
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full h-12 border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
