const express = require("express");
const axios = require("axios");

const router = express.Router();

// 15 COIN
const COINS = [
  "bitcoin",
  "ethereum",
  "binancecoin",
  "solana",
  "ripple",
  "cardano",
  "dogecoin",
  "tron",
  "polkadot",
  "polygon",
  "litecoin",
  "chainlink",
  "stellar",
  "avalanche-2",
  "uniswap"
];

// GET DATA CRYPTO
router.get("/coins", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: COINS.join(","),
          order: "market_cap_desc",
          per_page: 15,
          page: 1,
          sparkline: false
        }
      }
    );

    res.json({
      success: true,
      data: response.data || []
    });
  } catch (error) {
    console.error("COINS ERROR:", error.message);
    res.status(500).json({
      success: false,
      data: [],
      message: "Gagal mengambil data crypto"
    });
  }
});
router.get("/chart/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: "usd",
          days: 3
        }
      }
    );

    const prices = response.data.prices || [];

    const formatted = prices
      .filter((_, i) => i % 10 === 0)
      .map((p) => ({
        time: new Date(p[0]).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        price: p[1]
      }));

    res.json({ prices: formatted });
  } catch (error) {
    console.error("CHART ERROR:", error.message);
    res.status(500).json({ prices: [] });
  }
});

module.exports = router;
