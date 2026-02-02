const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["BUY", "SELL"], required: true },
  coinId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  balance: {
    type: Number,
    default: 1000000
  },

  portfolio: {
    type: [portfolioSchema],
    default: [] // 🔥 PENTING
  },

  transactions: {
    type: [transactionSchema],
    default: [] // 🔥 PENTING
  }
});

module.exports = mongoose.model("User", userSchema);
