import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

/**
 * AuthContext
 *
 * - Stores token + user in React state and localStorage
 * - Keeps axios.defaults.headers.common.Authorization in sync
 * - Exposes: login(mail, password), loginAsUser(userId), register(formData), logout()
 *
 * Assumptions based on your backend:
 * - POST /api/login returns { token, user }
 * - POST /api/loginAsUser/:id returns { token, user }
 * - POST /api/Create-Users creates a user (may require admin token)
 */

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Keep axios default header synced with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Normal login (email + password)
  const login = async (mail, password) => {
    setLoading(true);
    try {
      const res = await axios.post("https://safari-blogs-webpage-2.onrender.com/api/login", {
        mail,
        password,
      });
      const receivedToken = res.data?.token;
      const receivedUser = res.data?.user ?? null;

      if (!receivedToken) {
        return { success: false, message: "No token returned from login" };
      }

      localStorage.setItem("token", receivedToken);
      if (receivedUser)
        localStorage.setItem("user", JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      console.error("login error", err);
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Impersonate / Login as user (admin -> user)
  const loginAsUser = async (userId) => {
    setLoading(true);
    try {
      // attach current token (admin) if present so backend authorizes impersonation
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `https://safari-blogs-webpage-2.onrender.com/api/loginAsUser/${userId}`,
        {},
        { headers }
      );
      const receivedToken = res.data?.token;
      const receivedUser = res.data?.user ?? null;

      if (!receivedToken) {
        return {
          success: false,
          message: "No token returned from loginAsUser",
        };
      }

      // Persist impersonated user's token + user
      localStorage.setItem("token", receivedToken);
      if (receivedUser)
        localStorage.setItem("user", JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      console.error("loginAsUser error", err);
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register/create user. If admin token exists, it will be attached.
  const register = async (formData) => {
    setLoading(true);
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(
        "https://safari-blogs-webpage-2.onrender.com/api/Create-Users",
        formData,
        { headers }
      );
      return { success: true, data: res.data };
    } catch (err) {
      console.error("register error", err);
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.reload();
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, loginAsUser, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
