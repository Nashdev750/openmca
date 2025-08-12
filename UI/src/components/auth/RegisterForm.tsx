import React, { useState } from 'react';
import { AuthData } from '../../types/auth';
import { Mail, Phone, ArrowRight, LogIn } from 'lucide-react';
import { authApi, AuthApiError } from '../../services/authApi';
import toast from 'react-hot-toast';

interface RegisterFormProps {
  authData: AuthData;
  updateAuthData: (data: Partial<AuthData>) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ authData, updateAuthData }) => {
  const [formData, setFormData] = useState({
    email: authData.email || '',
    phoneNumber: authData.phoneNumber || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!formData.phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    const toastId = toast.loading('Sending OTP...');
    
    try {
      await authApi.sendOtp({ phone: formData.phoneNumber.trim() });
      
      toast.success('OTP sent successfully!', { id: toastId });
      
      updateAuthData({
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
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

  const switchToLogin = () => {
    updateAuthData({ step: 'login' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
        <p className="text-gray-600">Get started with your new account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="john@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

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
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
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
          Already have an account?{' '}
          <button
            onClick={switchToLogin}
            disabled={isLoading}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;