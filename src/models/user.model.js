const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

async function createUser(user) {
  const newUser = new User(user);
  await newUser.save();
  return newUser;
}

module.exports = { User, createUser };
