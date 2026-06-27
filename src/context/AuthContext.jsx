import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Flask Backend
export const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edu_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      delete api.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  // ===========================
  // Fetch Logged In User
  // ===========================
  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Login
  // ===========================
  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('edu_token', newToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(newUser);

      return {
        success: true
      };

    } catch (err) {

      return {
        success: false,
        error: err.response?.data?.message || "Login Failed"
      };

    }
  };

  // ===========================
  // Register
  // ===========================
  const register = async (
    name,
    email,
    password,
    confirmPassword,
    role
  ) => {

    try {

      const res = await api.post('/api/auth/register', {

        name,
        email,
        password,
        confirmPassword,
        role

      });

      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem("edu_token", newToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);

      setUser(newUser);

      return {
        success: true
      };

    } catch (err) {

      return {

        success: false,

        error:
          err.response?.data?.message ||
          "Registration Failed"

      };

    }
  };

  // ===========================
  // Logout
  // ===========================
  const logout = () => {

    localStorage.removeItem("edu_token");

    delete api.defaults.headers.common["Authorization"];

    setToken(null);

    setUser(null);

  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;