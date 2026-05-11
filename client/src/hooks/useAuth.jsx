import { createContext, useContext, useEffect, useState } from "react";

import { getProfile, login as loginRequest, register as registerRequest } from "../services/authService";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("bayanihanHubUser");
  return storedUser ? JSON.parse(storedUser) : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem("bayanihanHubToken")));

  useEffect(() => {
    const token = localStorage.getItem("bayanihanHubToken");

    if (!token) {
      setIsLoading(false);
      return;
    }

    getProfile()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem("bayanihanHubUser", JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.removeItem("bayanihanHubToken");
        localStorage.removeItem("bayanihanHubUser");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistSession = (session) => {
    localStorage.setItem("bayanihanHubToken", session.token);
    localStorage.setItem("bayanihanHubUser", JSON.stringify(session.user));
    setUser(session.user);
  };

  const login = async (credentials) => {
    const session = await loginRequest(credentials);
    persistSession(session);
    return session.user;
  };

  const register = async (payload) => {
    const session = await registerRequest(payload);
    persistSession(session);
    return session.user;
  };

  const logout = () => {
    localStorage.removeItem("bayanihanHubToken");
    localStorage.removeItem("bayanihanHubUser");
    setUser(null);
  };

  const value = {
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    register,
    user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
