const mongoose = require("mongoose");
const { string } = require("zod");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
});

export const User = mongoose.model("User", userSchema);
