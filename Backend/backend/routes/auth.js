// const express = require("express");
// const bcrypt = require("bcryptjs");
// const User = require("../models/user");
// const jwt = require("jsonwebtoken");
// const router = express.Router();

// /* ========== REGISTER ========== */
// router.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({ message: "Data tidak lengkap" });
//   }

//   try {
//     const userExist = await User.findOne({ email });
//     if (userExist) {
//       return res.status(400).json({ message: "Email sudah terdaftar" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       name,
//       email,
//       password: hashPassword
//     });

//     await user.save();

//     res.json({ message: "Register berhasil" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* ========== LOGIN ========== */
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body || {};

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email dan password wajib diisi" });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Email tidak ditemukan" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Password salah" });
//     }

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// module.exports = router;
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

    /* ========= AUTO ADMIN LOGIN ========= */
    if (email === "admin@gmail.com" && password === "Meboos.18") {

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

      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          balance: admin.balance
        }
      });
    }

    /* ========= LOGIN NORMAL ========= */

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
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
        balance: user.balance
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
