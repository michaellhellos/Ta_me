const express = require("express");
const axios = require("axios");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/buy", auth, async (req, res) => {
  const { coinId, quantity } = req.body;

  try {
    const user = await User.findById(req.userId);

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: coinId
        }
      }
    );

    const coin = response.data[0];
    const totalCost = coin.current_price * quantity;

    if (user.balance < totalCost) {
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    user.balance -= totalCost;

    const existing = user.portfolio.find(
      (p) => p.symbol === coin.symbol.toUpperCase()
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.portfolio.push({
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        quantity
      });
    }

    await user.save();

    res.json({
      success: true,
      balance: user.balance,
      portfolio: user.portfolio
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
