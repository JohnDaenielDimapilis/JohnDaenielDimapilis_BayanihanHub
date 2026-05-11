export const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const getAuthValidationErrors = ({ email, password, fullName }) => {
  const errors = {};

  if (fullName !== undefined && !fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!validateEmail(email || "")) {
    errors.email = "Enter a valid email address.";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
};
