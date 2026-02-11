const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  coinId: String,
  name: String,
  symbol: String,
  price: Number,
  quantity: Number
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
