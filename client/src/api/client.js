const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("bayanihan_token");
}

export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`);
  return data;
}

// Auth endpoints
export const authApi = {
  login: (payload) => api("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => api("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => api("/auth/me")
};

// Events endpoints
export const eventsApi = {
  getAll: () => api("/events"),
  getById: (id) => api(`/events/${id}`),
  create: (payload) => api("/events", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/events/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => api(`/events/${id}`, { method: "DELETE" }),
  approve: (id) => api(`/events/${id}/approve`, { method: "PATCH" }),
  reject: (id) => api(`/events/${id}/reject`, { method: "PATCH" })
};

// Fundraisers endpoints
export const fundraisersApi = {
  getAll: () => api("/fundraisers"),
  getById: (id) => api(`/fundraisers/${id}`),
  create: (payload) => api("/fundraisers", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/fundraisers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => api(`/fundraisers/${id}`, { method: "DELETE" }),
  approve: (id) => api(`/fundraisers/${id}/approve`, { method: "PATCH" }),
  reject: (id) => api(`/fundraisers/${id}/reject`, { method: "PATCH" })
};

// Donations endpoints
export const donationsApi = {
  getAll: () => api("/donations"),
  create: (payload) => api("/donations", { method: "POST", body: JSON.stringify(payload) }),
  verify: (id, payload = {}) => api(`/donations/${id}/verify`, { method: "PATCH", body: JSON.stringify(payload) }),
  reject: (id, payload) => api(`/donations/${id}/reject`, { method: "PATCH", body: JSON.stringify(payload) }),
  refund: (id, payload) => api(`/donations/${id}/refund`, { method: "PATCH", body: JSON.stringify(payload) })
};

// Participants endpoints
export const participantsApi = {
  getAll: () => api("/participants"),
  join: (eventId) => api(`/participants/events/${eventId}/join`, { method: "POST" }),
  updateStatus: (id, payload) => api(`/participants/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) })
};

// Feedback endpoints
export const feedbackApi = {
  getAll: () => api("/feedback"),
  create: (payload) => api("/feedback", { method: "POST", body: JSON.stringify(payload) })
};

// Achievements endpoints
export const achievementsApi = {
  getAll: () => api("/achievements"),
  recalculate: (userId) => api(`/achievements/${userId}/recalculate`, { method: "PATCH" })
};

// Reports endpoints
export const reportsApi = {
  getAll: () => api("/reports")
};

// Logs endpoints
export const logsApi = {
  getAll: () => api("/logs")
};

// Accounts endpoints
export const accountsApi = {
  getAll: () => api("/accounts"),
  create: (payload) => api("/accounts", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => api(`/accounts/${id}`, { method: "DELETE" })
};

// Security endpoints
export const securityApi = {
  getSummary: () => api("/security"),
  getLogs: () => api("/security/logs")
};

// Dashboard endpoints
export const dashboardApi = {
  get: () => api("/dashboard")
};
