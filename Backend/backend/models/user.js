const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["admin", "user", "mentor"],
    default: "user"
  },

  balance: {
    type: Number,
    default: 1000000
  }
});

module.exports = mongoose.model("User", userSchema);
