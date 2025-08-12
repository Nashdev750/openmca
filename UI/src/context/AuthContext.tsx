import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';
import { authApi, AuthApiError } from '../services/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on app load
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const isValid = await authApi.verifySession();
        if (isValid) {
          // If session is valid, we need to get user data
          // For now, we'll create a placeholder user since we don't have a user info endpoint
          setUser({
            id: 'current-user',
            email: 'user@example.com', // This should come from a user info endpoint
            phoneNumber: 'stored-phone', // This should come from a user info endpoint
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Don't show error toast for session check failures on app load
        // as this is expected for users who aren't logged in
        console.log('No valid session found');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const toastId = toast.loading('Signing out...');
    
    try {
      await authApi.logout();
      toast.success('Signed out successfully', { id: toastId });
    } catch (error) {
      // Even if logout API fails, we still want to clear local state
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'Logout request failed, but you have been signed out locally';
      
      toast.error(errorMessage, { id: toastId });
      console.error('Logout failed:', error);
    }
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};