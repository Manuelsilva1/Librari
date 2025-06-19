import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
  const storedToken = localStorage.getItem('authToken');
  const storedUser  = localStorage.getItem('authUser');

  if (storedToken && storedUser) {
    try {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Ensure the auth token is also available as a cookie for the middleware
      document.cookie = `authToken=${storedToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
    } catch (err) {
      console.warn('authUser corrupto, se limpia →', err);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }
}, []);


  const login = (newToken: string, userData: any) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    document.cookie = `authToken=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    document.cookie = 'authToken=; path=/; max-age=0';
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
