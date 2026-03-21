const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

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
      role: user.role,
      specialization: user.specialization || "",
      bio: user.bio || "",
      experience: user.experience || 0,
      style: user.style || ""
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE USER PROFILE (SELF)
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, password, specialization, bio, experience, style } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    if (email && email !== user.email) {
      const emailExist = await User.findOne({ email });
      if (emailExist) {
        return res.status(400).json({ success: false, message: "Email sudah digunakan" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    
    // Mentor specific fields
    if (specialization !== undefined) user.specialization = specialization;
    if (bio !== undefined) user.bio = bio;
    if (experience !== undefined) user.experience = experience;
    if (style !== undefined) user.style = style;

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role,
        specialization: user.specialization,
        bio: user.bio,
        experience: user.experience,
        style: user.style
      }
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
