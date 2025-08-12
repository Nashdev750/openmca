import React, { useState } from 'react';
import { AuthData, AuthStep } from '../../types/auth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OTPVerification from './OTPVerification';
import Dashboard from '../Dashboard';
import { Building2 } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [authData, setAuthData] = useState<AuthData>({
    phoneNumber: '',
    step: 'login'
  });

  const updateAuthData = (data: Partial<AuthData>) => {
    setAuthData(prev => ({ ...prev, ...data }));
  };

  const renderAuthStep = () => {
    switch (authData.step) {
      case 'login':
        return <LoginForm authData={authData} updateAuthData={updateAuthData} />;
      case 'register':
        return <RegisterForm authData={authData} updateAuthData={updateAuthData} />;
      case 'otp-verification':
        return <OTPVerification authData={authData} updateAuthData={updateAuthData} />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <LoginForm authData={authData} updateAuthData={updateAuthData} />;
    }
  };

  if (authData.step === 'dashboard') {
    return renderAuthStep();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">OpenMCA Tools</h1>
          <p className="mt-2 text-sm text-gray-600">Your productivity companion</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {renderAuthStep()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;