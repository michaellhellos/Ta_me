const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashPassword,
      role: role || "user" // default user
    });

    await user.save();

    res.json({ message: "Register berhasil" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    /* ===============================
       AUTO CREATE ADMIN (JIKA BELUM ADA)
    =============================== */
    if (email === "admin@gmail.com") {

      let admin = await User.findOne({ email });

      if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash("Meboos.18", salt);

        admin = new User({
          name: "Administrator",
          email: "admin@gmail.com",
          password: hashPassword,
          role: "admin"
        });

        await admin.save();
      }
    }

    /* ===============================
       LOGIN SEMUA ROLE (ADMIN/MENTOR/USER)
    =============================== */

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        specialization: user.specialization || null
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/user", async (req, res) => {
  try {
    const { role } = req.query;

    let filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password") // ❌ jangan kirim password
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: users.length,
      data: users
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user"
    });
  }
});
// EDIT USER
router.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, role, balance } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        role,
        balance
      },
      { new: true } // return data terbaru
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: updatedUser
    });

  } catch (error) {
    console.error("EDIT USER ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal update user"
    });
  }
});
module.exports = router;
