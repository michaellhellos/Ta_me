const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mentorOnly = require("../middleware/mentorOnly");
const CommunityPost = require("../models/CommunityPost");

/* ===============================
   CREATE POST (MENTOR)
================================= */
router.post("/create", auth, mentorOnly, async (req, res) => {
  try {
    const { content, image, file, link } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content tidak boleh kosong" });
    }

    const newPost = new CommunityPost({
      author: req.user._id,
      authorName: req.user.name,
      role: req.user.role,
      content,
      image: image || null,
      file: file || null,
      link: link || null
    });

    await newPost.save();

    res.status(201).json({
      message: "Broadcast berhasil dibuat",
      post: newPost
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET ALL POSTS
================================= */
router.get("/all", auth, async (req, res) => {
  try {
    const posts = await CommunityPost.find({ isActive: true })
      .populate("author", "name email")
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(posts);

  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;