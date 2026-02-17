const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// GET USER DATA
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // 🔥 TAMBAHKAN INI
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
