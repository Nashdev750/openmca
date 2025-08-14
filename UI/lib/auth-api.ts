export interface AuthResponse {
  success: boolean
  message?: string
}

export interface SendOtpRequest {
  phone: string
  email?: string
}

export interface VerifyOtpRequest {
  phone: string
  code: string
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = "AuthApiError"
  }
}

const API_BASE_URL = "https://openmca.com/api/auth"

class AuthApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, defaultOptions)

      const data = await response.json()
      if (!response.ok) {
        console.log(data)
        throw new AuthApiError(data.error, response.status)
      }

      return data
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error
      }

      // Network or other errors
      throw new AuthApiError("Network error occurred. Please check your connection.", 0, "NETWORK_ERROR")
    }
  }

  async sendOtp(request: SendOtpRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>("/send-otp", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>("/verify-otp", {
      method: "POST",
      credentials: "include", // Important for session cookie
      body: JSON.stringify(request),
    })
  }

  async verifySession(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-session`, {
        method: "GET",
        credentials: "include",
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Added logout method for session cleanup
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // Ignore logout errors - session will be cleared client-side
    }
  }
}

export const authApi = new AuthApiService()
