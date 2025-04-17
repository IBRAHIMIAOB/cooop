import React, { createContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'regular' | 'root' | null;
  username: string | null;
  login: (username: string, type: 'regular' | 'root') => void;
  logout: () => void;
}

const defaultValue: AuthContextType = {
  isAuthenticated: false,
  userType: null,
  username: null,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export default AuthContext;
