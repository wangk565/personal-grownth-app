import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 你可以在这里添加一个API调用来验证token并获取用户信息
      // 为了简单起见，我们暂时只解码token
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || '登录失败');
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      await api.auth.register({ username, email, password });
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || '注册失败');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const authContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};