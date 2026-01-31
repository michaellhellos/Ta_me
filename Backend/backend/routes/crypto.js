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
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data crypto"
    });
  }
});

module.exports = router;
