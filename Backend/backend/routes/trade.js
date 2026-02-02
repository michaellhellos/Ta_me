const express = require("express");
const axios = require("axios");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/buy", auth, async (req, res) => {
  const { coinId, quantity } = req.body;

  // ✅ VALIDASI INPUT
  if (!coinId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Data tidak valid" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: coinId
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(400).json({ message: "Coin tidak ditemukan" });
    }

    const coin = response.data[0];

    // ✅ PASTIKAN NUMBER
    const price = Number(coin.current_price);
    const qty = Number(quantity);
    const totalCost = price * qty;

    if (isNaN(price) || isNaN(qty)) {
      return res.status(400).json({ message: "Harga atau jumlah tidak valid" });
    }

    if (user.balance < totalCost) {
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    // ✅ UPDATE BALANCE
    user.balance -= totalCost;

    // ✅ UPDATE PORTFOLIO
    const existing = user.portfolio.find(p => p.coinId === coin.id);

    if (existing) {
      existing.quantity += qty;
      existing.price = price;
    } else {
      user.portfolio.push({
        coinId: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: price,
        quantity: qty
      });
    }

    // ✅ SIMPAN TRANSAKSI
    user.transactions.push({
      type: "BUY",
      coinId: coin.id,
      name: coin.name,
      price: price,
      quantity: qty,
      total: totalCost
    });

    await user.save();

    res.json({
      success: true,
      balance: user.balance,
      portfolio: user.portfolio,
      transactions: user.transactions
    });

  } catch (err) {
    console.error("BUY ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
