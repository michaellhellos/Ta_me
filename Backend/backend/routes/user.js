const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");

  res.json({
    balance: user.balance,
    portfolio: user.portfolio
  });
});

module.exports = router;
