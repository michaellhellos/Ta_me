const Nilai = require("../models/Nilai");
const mongoose = require("mongoose");

exports.createNilai = async (req, res) => {
  try {
    const { userId, materiId, score, totalSoal } = req.body;

    if (!userId || !materiId) {
      return res.status(400).json({
        success: false,
        message: "userId dan materiId wajib diisi",
      });
    }

    // Validasi ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(materiId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Format ID tidak valid",
      });
    }

    // Cek apakah sudah pernah mengerjakan materi ini
    const existing = await Nilai.findOne({ userId, materiId });

    if (existing) {
      existing.score = score;
      existing.totalSoal = totalSoal;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Nilai berhasil diupdate",
        data: existing,
      });
    }

    const newNilai = new Nilai({
      userId,
      materiId,
      score,
      totalSoal,
    });

    await newNilai.save();

    res.status(201).json({
      success: true,
      message: "Nilai berhasil disimpan",
      data: newNilai,
    });
  } catch (error) {
    console.error("ERROR NILAI:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNilaiByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Format ID tidak valid",
      });
    }

    const User = mongoose.model("User");
    const user = await User.findById(userId).select("redeemedXp");

    const scores = await Nilai.find({ userId }).select(
      "materiId score totalSoal"
    );

    res.json({ success: true, data: scores, redeemedXp: user?.redeemedXp || 0 });
  } catch (error) {
    console.error("GET NILAI ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.redeemXp = async (req, res) => {
  try {
    const { userId, amountXp } = req.body;
    
    // Convert logic
    let reward = 0;
    if (amountXp === 40) reward = 5000;
    else if (amountXp === 80) reward = 12000;
    else return res.status(400).json({ success: false, message: "Opsi redeem tidak valid" });

    const scores = await Nilai.find({ userId });
    const totalEarned = scores.reduce((sum, n) => sum + n.score, 0);

    const User = mongoose.model("User");
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan" });

    const availableXp = totalEarned - (user.redeemedXp || 0);

    if (availableXp < amountXp) {
      return res.status(400).json({ success: false, message: "XP tidak mencukupi" });
    }

    user.redeemedXp = (user.redeemedXp || 0) + amountXp;
    user.balance = (user.balance || 0) + reward;
    await user.save();

    res.json({ 
      success: true, 
      message: `Berhasil redeem ${amountXp} XP menjadi $${reward}`,
      redeemedXp: user.redeemedXp,
      balance: user.balance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};