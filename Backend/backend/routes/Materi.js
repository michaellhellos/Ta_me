const express = require("express");
const router = express.Router();
const Materi = require("../models/Materi");
const Publish = require("../models/Publish");
// CREATE MATERI
router.post("/materi", async (req, res) => {
  try {
    const { title, summary, quizzes } = req.body;

    const materi = await Materi.create({
      title,
      summary,
      quizzes,
      status: "published"
    });

    res.status(201).json({
      success: true,
      data: materi
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat materi"
    });
  }
});
router.get("/materi", async (req, res) => {
  try {
    const materi = await Materi.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      total: materi.length,
      data: materi
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data"
    });
  }
});
// PUBLISH MATERI
router.post("/materi/:id/publish", async (req, res) => {
  try {
    const materi = await Materi.findById(req.params.id);

    if (!materi) {
      return res.status(404).json({
        success: false,
        message: "Materi tidak ditemukan"
      });
    }

    if (materi.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Materi sudah dipublish"
      });
    }

    const published = await Publish.create({
      title: materi.title,
      summary: materi.summary,
      quizzes: materi.quizzes // 🔥 otomatis 4 opsi ikut
    });

    materi.isPublished = true;
    await materi.save();

    res.json({
      success: true,
      message: "Materi berhasil dipublish",
      data: published
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal publish materi"
    });
  }
});
// GET ALL PUBLISHED
router.get("/publish", async (req, res) => {
  try {
    const data = await Publish.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      total: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil publish"
    });
  }
});
module.exports = router;