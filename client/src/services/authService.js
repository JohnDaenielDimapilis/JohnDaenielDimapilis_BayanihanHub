import api from "./api";
import { createDemoSession, findDemoAccount, getDemoUserFromToken, isDemoToken } from "../utils/demoAccounts";

// Logs in with local demo credentials first, then falls back to the real backend API.
export const login = async (credentials) => {
  const demoAccount = findDemoAccount(credentials);

  if (demoAccount) {
    return createDemoSession(demoAccount);
  }

  const { data } = await api.post("/auth/login", credentials);
  return data;
};

// Registers a real user through the backend when MongoDB is configured.
export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

// Reads the current profile from local demo auth or the protected backend endpoint.
export const getProfile = async () => {
  const token = localStorage.getItem("bayanihanHubToken");

  if (isDemoToken(token)) {
    return getDemoUserFromToken(token);
  }

  const { data } = await api.get("/auth/profile");
  return data.user;
};
