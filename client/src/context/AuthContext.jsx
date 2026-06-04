import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("bayanihan_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const data = await authApi.login({ email, password });
    localStorage.setItem("bayanihan_token", data.token);
    localStorage.setItem("bayanihan_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    localStorage.setItem("bayanihan_token", data.token);
    localStorage.setItem("bayanihan_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function googleLogin(payload = {}) {
    const data = await authApi.googleDemo(payload);
    localStorage.setItem("bayanihan_token", data.token);
    localStorage.setItem("bayanihan_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("bayanihan_token");
    localStorage.removeItem("bayanihan_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, register, googleLogin, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
