const BASE_URL = 'https://openmca.com/auth/api';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class AuthApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

class AuthApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = 'Invalid request. Please check your input.';
              break;
            case 401:
              errorMessage = 'Authentication failed. Please try again.';
              break;
            case 403:
              errorMessage = 'Access denied.';
              break;
            case 404:
              errorMessage = 'Service not found. Please try again later.';
              break;
            case 429:
              errorMessage = 'Too many requests. Please wait a moment and try again.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Request failed with status ${response.status}`;
          }
        }
        
        throw new AuthApiError(errorMessage, response.status);
      }

      return response.json();
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthApiError('Network error. Please check your connection and try again.');
      }
      
      throw new AuthApiError('An unexpected error occurred. Please try again.');
    }
  }

  async sendOtp(data: SendOtpRequest): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>('/send-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Failed to send OTP. Please try again.');
    }
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>('/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new AuthApiError('Failed to verify OTP. Please try again.');
    }
  }

  async verifySession(): Promise<boolean> {
    try {
      await this.makeRequest('/verify', {
        method: 'GET',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Logout endpoint might not exist or fail, but we still want to clear local state
      console.warn('Logout request failed, but continuing with local logout');
    }
  }
}

export const authApi = new AuthApiService();