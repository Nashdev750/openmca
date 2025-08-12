export interface User {
  id: string;
  email: string;
  phoneNumber: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export type AuthStep = 'login' | 'register' | 'otp-verification' | 'dashboard';

export interface AuthData {
  email?: string;
  phoneNumber: string;
  otp?: string;
  step: AuthStep;
}