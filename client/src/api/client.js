const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const API_BASE_URL = API_URL;

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
  googleDemo: (payload = {}) => api("/auth/google-demo", { method: "POST", body: JSON.stringify(payload) }),
  me: () => api("/auth/me")
};

// Events endpoints
export const eventsApi = {
  getAll: () => api("/events"),
  getPublic: () => api("/events/public"),
  getUserVisible: () => api("/events/user-visible"),
  getHistory: () => api("/events/history"),
  getById: (id) => api(`/events/${id}`),
  create: (payload) => api("/events", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/events/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => api(`/events/${id}`, { method: "DELETE" }),
  submit: (id, payload = {}) => api(`/events/${id}/submit`, { method: "PATCH", body: JSON.stringify(payload) }),
  approve: (id, payload = {}) => api(`/events/${id}/approve`, { method: "PATCH", body: JSON.stringify(payload) }),
  requestRevision: (id, payload) => api(`/events/${id}/request-revision`, { method: "PATCH", body: JSON.stringify(payload) }),
  reject: (id, payload) => api(`/events/${id}/reject`, { method: "PATCH", body: JSON.stringify(payload) }),
  openRegistration: (id) => api(`/events/${id}/open-registration`, { method: "PATCH" }),
  closeRegistration: (id) => api(`/events/${id}/close-registration`, { method: "PATCH" }),
  cancel: (id, payload) => api(`/events/${id}/cancel`, { method: "PATCH", body: JSON.stringify(payload) }),
  complete: (id, payload) => api(`/events/${id}/complete`, { method: "PATCH", body: JSON.stringify(payload) }),
  finish: (id, payload) => api(`/events/${id}/finish`, { method: "PATCH", body: JSON.stringify(payload) }),
  archive: (id) => api(`/events/${id}/archive`, { method: "PATCH" }),
  generateQr: (id) => api(`/events/${id}/generate-qr`, { method: "POST" }),
  getQr: (id) => api(`/events/${id}/qr`),
  scanQr: (id, payload) => api(`/events/${id}/scan-qr`, { method: "POST", body: JSON.stringify(payload) })
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
  getMy: () => api("/participants/my"),
  join: (eventId) => api(`/participants/events/${eventId}/join`, { method: "POST" }),
  cancel: (eventId, payload) => api(`/participants/events/${eventId}/cancel`, { method: "PATCH", body: JSON.stringify(payload) }),
  checkIn: (eventId, payload = {}) => api(`/participants/events/${eventId}/check-in`, { method: "POST", body: JSON.stringify(payload) }),
  scanQr: (eventId, payload) => api(`/participants/events/${eventId}/scan-qr`, { method: "POST", body: JSON.stringify(payload) }),
  getByEvent: (eventId) => api(`/participants/events/${eventId}`),
  updateStatus: (id, payload) => api(`/participants/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  manualAttendance: (id, payload) => api(`/participants/${id}/manual-attendance`, { method: "PATCH", body: JSON.stringify(payload) }),
  verifyAttendance: (id, payload = {}) => api(`/participants/${id}/verify-attendance`, { method: "PATCH", body: JSON.stringify(payload) }),
  exportUrl: (eventId) => `${API_URL}/participants/events/${eventId}/export`
};

// Feedback endpoints
export const feedbackApi = {
  getAll: () => api("/feedback"),
  getMy: () => api("/feedback/my"),
  create: (payload) => api("/feedback", { method: "POST", body: JSON.stringify(payload) })
};

// Achievements endpoints
export const achievementsApi = {
  getAll: () => api("/achievements"),
  recalculate: (userId) => api(`/achievements/${userId}/recalculate`, { method: "PATCH" })
};

// Reports endpoints
export const reportsApi = {
  getAll: () => api("/reports"),
  getTab: (type, query = "") => api(`/reports/${type}${query ? `?${query}` : ""}`),
  export: (query = "") => api(`/reports/export${query ? `?${query}` : ""}`)
};

// Logs endpoints
export const logsApi = {
  getAll: () => api("/logs")
};

// Accounts endpoints
export const accountsApi = {
  getAll: (role) => api(`/accounts${role && role !== "all" ? `?role=${role}` : ""}`),
  create: (payload) => api("/accounts", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  patch: (id, payload) => api(`/accounts/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  delete: (id) => api(`/accounts/${id}`, { method: "DELETE" }),
  resetPassword: (id, payload) => api(`/accounts/${id}/password`, { method: "PATCH", body: JSON.stringify(payload) }),
  ban: (id, payload) => api(`/accounts/${id}/ban`, { method: "PATCH", body: JSON.stringify(payload) }),
  unban: (id) => api(`/accounts/${id}/unban`, { method: "PATCH" }),
  me: () => api("/accounts/me"),
  updateMe: (payload) => api("/accounts/me", { method: "PUT", body: JSON.stringify(payload) }),
  changePassword: (payload) => api("/accounts/me/password", { method: "PATCH", body: JSON.stringify(payload) }),
  exportMe: () => api("/accounts/me/export"),
  deactivateMe: () => api("/accounts/me", { method: "DELETE" })
};

// Dashboard endpoints
export const dashboardApi = {
  get: () => api("/dashboard")
};

// Notifications endpoints
export const notificationsApi = {
  getAll: () => api("/notifications"),
  markRead: (id) => api(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => api("/notifications/read-all", { method: "PATCH" })
};
