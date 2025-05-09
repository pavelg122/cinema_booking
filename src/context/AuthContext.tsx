import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 'admin');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would be an API call
      // Simulating an API response for development
      if (email === 'admin@example.com' && password === 'admin123') {
        const adminUser = {
          id: 'admin-id',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        };
        setUser(adminUser);
        setIsAdmin(true);
        localStorage.setItem('user', JSON.stringify(adminUser));
      } else if (email === 'user@example.com' && password === 'user123') {
        const regularUser = {
          id: 'user-id',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        };
        setUser(regularUser);
        setIsAdmin(false);
        localStorage.setItem('user', JSON.stringify(regularUser));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would be an API call
      // Simulating user registration
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'user',
      };
      setUser(newUser);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};