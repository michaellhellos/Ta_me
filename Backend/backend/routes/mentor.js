const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");


// =======================
// CREATE MENTOR
// =======================
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, password, specialization, bio, experience, style } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);

    const mentor = new User({
      name,
      email,
      password: hashed,
      role: "mentor",
      specialization,
      bio,
      experience,
      style
    });

    await mentor.save();
    res.json({ message: "Mentor berhasil dibuat", mentor });

  } catch (err) {
    res.status(500).json(err);
  }
});


// =======================
// GET ALL MENTORS
// =======================
router.get("/", async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password");
    res.json(mentors);
  } catch (err) {
    res.status(500).json(err);
  }
});


// =======================
// UPDATE MENTOR
// =======================
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});


// =======================
// DELETE MENTOR
// =======================
router.delete("/:id", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Mentor berhasil dihapus" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
