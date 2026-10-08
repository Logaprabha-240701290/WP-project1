import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('bookloop_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('bookloop_token'));
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);

  const showFlash = useCallback((message, type = 'success', duration = 4000) => {
    setFlash({ message, type });
    if (duration > 0) {
      setTimeout(() => {
        setFlash((prev) => (prev?.message === message ? null : prev));
      }, duration);
    }
  }, []);

  const clearFlash = useCallback(() => {
    setFlash(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('bookloop_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await api.get('/auth/me');
      const freshUser = res.data.user;
      setUser(freshUser);
      localStorage.setItem('bookloop_user', JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
      // In case user was blocked or token expired
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('bookloop_token', receivedToken);
    localStorage.setItem('bookloop_user', JSON.stringify(receivedUser));
    
    showFlash(`Welcome back, ${receivedUser.name}!`, 'success');
    return receivedUser;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('bookloop_token', receivedToken);
    localStorage.setItem('bookloop_user', JSON.stringify(receivedUser));

    showFlash('Registration successful! 3 credits added to your account.', 'success');
    return receivedUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bookloop_token');
    localStorage.removeItem('bookloop_user');
    showFlash('You have been logged out.', 'info');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        flash,
        showFlash,
        clearFlash,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
