import React, { useState, useRef, useEffect } from 'react';
import { AuthData } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { authApi, AuthApiError } from '../../services/authApi';
import toast from 'react-hot-toast';

interface OTPVerificationProps {
  authData: AuthData;
  updateAuthData: (data: Partial<AuthData>) => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ authData, updateAuthData }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && value) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true);

    const toastId = toast.loading('Verifying OTP...');
    
    try {
      const response = await authApi.verifyOtp({
        phone: authData.phoneNumber,
        code: otpCode
      });

      if (response.success) {
        toast.success('Login successful!', { id: toastId });
        
        // Create user object
        const user = {
          id: 'current-user',
          email: authData.email || 'user@example.com',
          phoneNumber: authData.phoneNumber
        };

        login(user);
        updateAuthData({ step: 'dashboard' });
      } else {
        toast.error('Invalid OTP. Please try again.', { id: toastId });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'Verification failed. Please try again.';
      
      toast.error(errorMessage, { id: toastId });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      console.error('OTP verification failed:', error);
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendCooldown(30);

    const toastId = toast.loading('Resending OTP...');
    
    try {
      await authApi.sendOtp({ phone: authData.phoneNumber });
      toast.success('OTP sent successfully!', { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'Failed to resend OTP. Please try again.';
      
      toast.error(errorMessage, { id: toastId });
      setResendCooldown(0);
      console.error('Failed to resend OTP:', error);
    }
  };

  const goBack = () => {
    const step = authData.email ? 'register' : 'login';
    updateAuthData({ step });
  };

  return (
    <div className="px-8 py-10">
      <button
        onClick={goBack}
        disabled={isLoading}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your phone</h2>
        <p className="text-gray-600">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-gray-900">{authData.phoneNumber}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex space-x-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Verifying...
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isLoading}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className="inline h-4 w-4 mr-1" />
                  Resend OTP
                </>
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;