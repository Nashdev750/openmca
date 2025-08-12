import React, { useState } from 'react';
import { AuthData } from '../../types/auth';
import { Phone, ArrowRight, UserPlus } from 'lucide-react';
import { authApi, AuthApiError } from '../../services/authApi';
import toast from 'react-hot-toast';

interface LoginFormProps {
  authData: AuthData;
  updateAuthData: (data: Partial<AuthData>) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ authData, updateAuthData }) => {
  const [phoneNumber, setPhoneNumber] = useState(authData.phoneNumber);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    
    const toastId = toast.loading('Sending OTP...');
    
    try {
      await authApi.sendOtp({ phone: phoneNumber.trim() });
      
      toast.success('OTP sent successfully!', { id: toastId });
      
      updateAuthData({
        phoneNumber: phoneNumber.trim(),
        step: 'otp-verification'
      });
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'Failed to send OTP. Please try again.';
      
      toast.error(errorMessage, { id: toastId });
      console.error('Failed to send OTP:', error);
    }
    
    setIsLoading(false);
  };

  const switchToRegister = () => {
    updateAuthData({ step: 'register' });
  };

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="+1 (555) 123-4567"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Send OTP
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={switchToRegister}
            disabled={isLoading}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;