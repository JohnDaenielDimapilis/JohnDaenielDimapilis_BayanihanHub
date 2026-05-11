const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.password;
  return plainUser;
};

module.exports = sanitizeUser;
