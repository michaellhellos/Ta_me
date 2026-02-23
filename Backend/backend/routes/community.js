const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const mentorOnly = require("../middleware/mentorOnly");
const { uploadImage, uploadFile } = require("../middleware/upload");
const { sanitizeContent } = require("../middleware/sanitize");
const CommunityPost = require("../models/CommunityPost");

/* ===============================
   UPLOAD IMAGE
================================= */
router.post("/upload/image", auth, mentorOnly, uploadImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diupload" });
    }

    const fileData = {
      url: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      type: "image"
    };

    res.json({ success: true, ...fileData });

  } catch (error) {
    console.error("UPLOAD IMAGE ERROR:", error);
    res.status(500).json({ message: "Server error saat upload gambar" });
  }
});

/* ===============================
   UPLOAD FILE
================================= */
router.post("/upload/file", auth, mentorOnly, uploadFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diupload" });
    }

    const fileData = {
      url: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      type: "file"
    };

    res.json({ success: true, ...fileData });

  } catch (error) {
    console.error("UPLOAD FILE ERROR:", error);
    res.status(500).json({ message: "Server error saat upload file" });
  }
});

/* ===============================
   DELETE UPLOADED FILE
================================= */
router.delete("/upload/:filename", auth, mentorOnly, async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: prevent path traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ message: "Nama file tidak valid" });
    }

    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File tidak ditemukan" });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: "File berhasil dihapus" });

  } catch (error) {
    console.error("DELETE FILE ERROR:", error);
    res.status(500).json({ message: "Server error saat hapus file" });
  }
});

/* ===============================
   CREATE POST (MENTOR)
================================= */
router.post("/create", auth, mentorOnly, async (req, res) => {
  try {
    const { content, attachments, link } = req.body;

    // Validate content
    if (!content || content.replace(/<[^>]*>/g, "").trim() === "") {
      return res.status(400).json({ message: "Content tidak boleh kosong" });
    }

    // Sanitize HTML content
    const sanitizedContent = sanitizeContent(content);

    // Validate attachments
    const validAttachments = [];
    if (Array.isArray(attachments) && attachments.length > 0) {
      if (attachments.length > 5) {
        return res.status(400).json({ message: "Maksimal 5 attachment per post" });
      }

      for (const att of attachments) {
        if (!att.url || !att.url.startsWith("/uploads/")) {
          continue; // skip invalid
        }
        validAttachments.push({
          url: att.url,
          originalName: att.originalName || "file",
          mimeType: att.mimeType || "application/octet-stream",
          size: att.size || 0,
          type: att.type === "image" ? "image" : "file"
        });
      }
    }

    const newPost = new CommunityPost({
      author: req.user._id,
      authorName: req.user.name,
      role: req.user.role,
      content: sanitizedContent,
      attachments: validAttachments,
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

/* ===============================
   LIKE / UNLIKE POST
================================= */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some(id => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
      post.totalLikes = Math.max(0, post.totalLikes - 1);
    } else {
      // Like
      post.likes.push(req.user._id);
      post.totalLikes += 1;
    }

    await post.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      totalLikes: post.totalLikes
    });

  } catch (error) {
    console.error("LIKE POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;