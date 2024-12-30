const transformUserFromDbToClient = (user) => {
  return {
    id: user._id,
    displayName: user.displayName,
  };
};

module.exports = { transformUserFromDbToClient };
