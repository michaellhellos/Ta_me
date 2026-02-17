// const express = require("express");
// const axios = require("axios");
// const User = require("../models/user");
// const auth = require("../middleware/auth");
// const Transaction = require("../models/Transaction");
// const Portfolio = require("../models/Portfolio");

// const router = express.Router();

// /* =========================
//    KONFIGURASI
// ========================= */

// const COINS = [
//   "bitcoin",
//   "ethereum",
//   "binancecoin",
//   "solana",
//   "ripple",
//   "cardano",
//   "dogecoin",
//   "tron",
//   "polkadot",
//   "polygon",
//   "litecoin",
//   "chainlink",
//   "stellar",
//   "avalanche-2",
//   "uniswap"
// ];

// const axiosCG = axios.create({
//   baseURL: "https://api.coingecko.com/api/v3",
//   headers: {
//     Accept: "application/json",
//     "User-Agent": "Mozilla/5.0"
//   },
//   timeout: 10000
// });

// // Cache
// let coinsCache = {
//   data: null,
//   time: 0
// };

// const chartCache = {};
// const priceCache = {};

// // TTL
// const COINS_TTL = 60 * 1000;
// const CHART_TTL = 60 * 1000;
// const PRICE_TTL = 30 * 1000;

// /* =========================
//    GET LIST COIN
// ========================= */
// router.get("/coins", async (req, res) => {
//   try {
//     // 🔥 PAKAI CACHE
//     if (coinsCache.data && Date.now() - coinsCache.time < COINS_TTL) {
//       return res.json({ success: true, data: coinsCache.data });
//     }

//     const response = await axiosCG.get("/coins/markets", {
//       params: {
//         vs_currency: "usd",
//         ids: COINS.join(","),
//         order: "market_cap_desc",
//         per_page: 15,
//         page: 1,
//         sparkline: false
//       }
//     });

//     coinsCache = {
//       data: response.data,
//       time: Date.now()
//     };

//     res.json({ success: true, data: response.data });
//   } catch (err) {
//     console.error("COINS ERROR:", err.response?.status, err.message);
//     res.status(500).json({
//       success: false,
//       data: [],
//       message: "Gagal mengambil data crypto"
//     });
//   }
// });


// /* =========================
//    GET CHART
// ========================= */
// router.get("/chart/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const cached = chartCache[id];
//     if (cached && Date.now() - cached.time < CHART_TTL) {
//       return res.json({ prices: cached.data });
//     }

//     const response = await axiosCG.get(`/coins/${id}/market_chart`, {
//       params: { vs_currency: "usd", days: 3 }
//     });

//     const formatted = response.data.prices
//       .filter((_, i) => i % 10 === 0)
//       .map(p => ({
//         time: new Date(p[0]).toLocaleTimeString("id-ID", {
//           hour: "2-digit",
//           minute: "2-digit"
//         }),
//         price: p[1]
//       }));

//     chartCache[id] = { data: formatted, time: Date.now() };

//     res.json({ prices: formatted });
//   } catch (err) {
//     console.error("CHART ERROR:", err.response?.status, err.message);
//     res.status(500).json({ prices: [] });
//   }
// });

// /* =========================
//    HELPER: GET PRICE (CACHE)
// ========================= */
// async function getCoinPrice(coinId) {
//   const cached = priceCache[coinId];
//   if (cached && Date.now() - cached.time < PRICE_TTL) {
//     return cached.data;
//   }

//   try {
//     const response = await axiosCG.get("/coins/markets", {
//       params: { vs_currency: "usd", ids: coinId }
//     });

//     if (!response.data || !response.data.length) return null;

//     priceCache[coinId] = {
//       data: response.data[0],
//       time: Date.now()
//     };

//     return response.data[0];
//   } catch (err) {
//     // 🔥 JIKA 429 → PAKAI CACHE LAMA
//     if (err.response?.status === 429 && cached) {
//       console.warn("429 detected, using cached price:", coinId);
//       return cached.data;
//     }

//     throw err;
//   }
// }


// /* =========================
//    BUY COIN
// ========================= */
// router.post("/buy", auth, async (req, res) => {
//   const qty = Number(req.body.quantity);
//   const coinId = req.body.coinId;

//   if (!coinId || isNaN(qty) || qty <= 0) {
//     return res.status(400).json({ message: "Quantity tidak valid" });
//   }

//   try {
//     const user = await User.findById(req.userId);
//     if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

//     user.portfolio = user.portfolio || [];
//     user.transactions = user.transactions || [];

//     const coin = await getCoinPrice(coinId);
//     if (!coin) return res.status(400).json({ message: "Coin tidak ditemukan" });

//     const price = Number(coin.current_price);
//     const totalCost = price * qty;

//     if (user.balance < totalCost) {
//       return res.status(400).json({ message: "Saldo tidak cukup" });
//     }

//     user.balance -= totalCost;

//     const existing = user.portfolio.find(p => p.coinId === coin.id);

//     if (existing) {
//       existing.quantity += qty;
//       existing.price = price;
//     } else {
//       user.portfolio.push({
//         coinId: coin.id,
//         name: coin.name,
//         symbol: coin.symbol.toUpperCase(),
//         price,
//         quantity: qty
//       });
//     }

//     user.transactions.push({
//       type: "BUY",
//       coinId: coin.id,
//       name: coin.name,
//       price,
//       quantity: qty,
//       total: totalCost
//     });

//     await user.save();

//     res.json({ success: true });
//   } catch (err) {
//     console.error("BUY ERROR:", err.response?.status, err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =========================
//    SELL COIN
// ========================= */
// router.post("/sell", auth, async (req, res) => {
//   const qty = Number(req.body.quantity);
//   const coinId = req.body.coinId;

//   if (!coinId || isNaN(qty) || qty <= 0) {
//     return res.status(400).json({ message: "Quantity tidak valid" });
//   }

//   try {
//     const user = await User.findById(req.userId);
//     if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

//     const owned = user.portfolio.find(p => p.coinId === coinId);
//     if (!owned || owned.quantity < qty) {
//       return res.status(400).json({ message: "Jumlah coin tidak mencukupi" });
//     }

//     const coin = await getCoinPrice(coinId);
//     if (!coin) return res.status(400).json({ message: "Coin tidak ditemukan" });

//     const price = Number(coin.current_price);
//     const totalGain = price * qty;

//     user.balance += totalGain;
//     owned.quantity -= qty;

//     if (owned.quantity <= 0) {
//       user.portfolio = user.portfolio.filter(p => p.coinId !== coinId);
//     }

//     user.transactions.push({
//       type: "SELL",
//       coinId: coin.id,
//       name: coin.name,
//       price,
//       quantity: qty,
//       total: totalGain
//     });

//     await user.save();

//     res.json({ success: true });
//   } catch (err) {
//     console.error("SELL ERROR:", err.response?.status, err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =========================
//    HISTORY
// ========================= */
// router.get("/history", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.userId);
//     if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

//     const transactions = Array.isArray(user.transactions)
//       ? user.transactions
//       : [];

//     res.json({
//       success: true,
//       transactions: [...transactions].reverse()
//     });
//   } catch (err) {
//     console.error("HISTORY ERROR:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// module.exports = router;
const express = require("express");
const axios = require("axios");
const User = require("../models/user");
const Transaction = require("../models/Transaction");
const Portfolio = require("../models/Portfolio");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================
   KONFIGURASI
========================= */

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

const axiosCG = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  headers: {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0"
  },
  timeout: 10000
});

// Cache
let coinsCache = { data: null, time: 0 };
const chartCache = {};
const priceCache = {};

const COINS_TTL = 60 * 1000;
const CHART_TTL = 60 * 1000;
const PRICE_TTL = 30 * 1000;

/* =========================
   GET LIST COIN
========================= */
router.get("/coins", async (req, res) => {
  try {
    if (coinsCache.data && Date.now() - coinsCache.time < COINS_TTL) {
      return res.json({ success: true, data: coinsCache.data });
    }

    const response = await axiosCG.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        ids: COINS.join(","),
        order: "market_cap_desc",
        per_page: 15,
        page: 1
      }
    });

    coinsCache = { data: response.data, time: Date.now() };

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: [] });
  }
});

/* =========================
   GET CHART
========================= */
router.get("/chart/:id", async (req, res) => {
  try {
    const cached = chartCache[req.params.id];
    if (cached && Date.now() - cached.time < CHART_TTL) {
      return res.json({ prices: cached.data });
    }

    const response = await axiosCG.get(
      `/coins/${req.params.id}/market_chart`,
      { params: { vs_currency: "usd", days: 3 } }
    );

    const data = response.data.prices.map(p => ({
      time: new Date(p[0]).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      price: p[1]
    }));

    chartCache[req.params.id] = { data, time: Date.now() };

    res.json({ prices: data });
  } catch (err) {
    console.error(err);
    res.json({ prices: [] });
  }
});

/* =========================
   HELPER PRICE
========================= */
async function getCoinPrice(id) {
  const cached = priceCache[id];
  if (cached && Date.now() - cached.time < PRICE_TTL) {
    return cached.data;
  }

  const res = await axiosCG.get("/coins/markets", {
    params: { vs_currency: "usd", ids: id }
  });

  if (!res.data.length) return null;

  priceCache[id] = { data: res.data[0], time: Date.now() };

  return res.data[0];
}

/* =========================
   BUY
========================= */
router.post("/buy", auth, async (req, res) => {
  try {
    const qty = Number(req.body.quantity);
    const coinId = req.body.coinId;

    if (!coinId || qty <= 0) {
      return res.status(400).json({ message: "Quantity tidak valid" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const coin = await getCoinPrice(coinId);
    if (!coin) {
      return res.status(400).json({ message: "Coin tidak ditemukan" });
    }

    const total = coin.current_price * qty;

    if (user.balance < total) {
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    user.balance -= total;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "BUY",
      coinId: coin.id,
      name: coin.name,
      price: coin.current_price,
      quantity: qty,
      total
    });

    const portfolio = await Portfolio.findOne({
      userId: user._id,
      coinId: coin.id
    });

    if (portfolio) {
      portfolio.quantity += qty;
      portfolio.price = coin.current_price;
      await portfolio.save();
    } else {
      await Portfolio.create({
        userId: user._id,
        coinId: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        quantity: qty
      });
    }

    res.json({ success: true, message: "Berhasil membeli coin" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   SELL
========================= */
router.post("/sell", auth, async (req, res) => {
  try {
    const qty = Number(req.body.quantity);
    const coinId = req.body.coinId;

    if (!coinId || qty <= 0) {
      return res.status(400).json({ message: "Quantity tidak valid" });
    }

    const portfolio = await Portfolio.findOne({
      userId: req.user.id,
      coinId
    });

    if (!portfolio || portfolio.quantity < qty) {
      return res.status(400).json({ message: "Coin tidak cukup" });
    }

    const coin = await getCoinPrice(coinId);
    if (!coin) {
      return res.status(400).json({ message: "Coin tidak ditemukan" });
    }

    const total = coin.current_price * qty;

    portfolio.quantity -= qty;

    if (portfolio.quantity <= 0) {
      await portfolio.deleteOne();
    } else {
      await portfolio.save();
    }

    const user = await User.findById(req.user.id);
    user.balance += total;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "SELL",
      coinId,
      name: coin.name,
      price: coin.current_price,
      quantity: qty,
      total
    });

    res.json({ success: true, message: "Berhasil menjual coin" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   HISTORY
========================= */
router.get("/history", auth, async (req, res) => {
  try {
    const data = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, transactions: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

