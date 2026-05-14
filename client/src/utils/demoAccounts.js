export const demoAccounts = [
  {
    label: "Admin Demo",
    email: "admin@bayanihanhub.test",
    password: "Admin@123",
    user: {
      _id: "demo-admin",
      fullName: "Demo Admin",
      email: "admin@bayanihanhub.test",
      role: "admin",
      status: "active",
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z"
    }
  },
  {
    label: "Staff Demo",
    email: "staff@bayanihanhub.test",
    password: "Staff@123",
    user: {
      _id: "demo-staff",
      fullName: "Demo Staff",
      email: "staff@bayanihanhub.test",
      role: "staff",
      status: "active",
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z"
    }
  },
  {
    label: "User Demo",
    email: "user@bayanihanhub.test",
    password: "User@123",
    user: {
      _id: "demo-user",
      fullName: "Demo User",
      email: "user@bayanihanhub.test",
      role: "user",
      status: "active",
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z"
    }
  }
];

// Finds a demo account that exactly matches the submitted login credentials.
export const findDemoAccount = ({ email, password }) =>
  demoAccounts.find((account) => account.email === email?.trim().toLowerCase() && account.password === password);

// Creates a local-only session object that mimics the backend login response shape.
export const createDemoSession = (account) => ({
  token: `demo-token-${account.user.role}`,
  user: account.user
});

// Checks whether a stored token belongs to one of the local demo accounts.
export const isDemoToken = (token) => token?.startsWith("demo-token-");

// Resolves a stored demo token back to its corresponding demo user.
export const getDemoUserFromToken = (token) => {
  const role = token?.replace("demo-token-", "");
  return demoAccounts.find((account) => account.user.role === role)?.user || null;
};
