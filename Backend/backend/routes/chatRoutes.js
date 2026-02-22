const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================================
   1️⃣ BUAT ATAU AMBIL CONVERSATION
========================================= */

router.post("/conversation", auth, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    // cek apakah conversation sudah ada
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error.message);
    res.status(500).json({ success: false });
  }
});

/* =========================================
   2️⃣ KIRIM MESSAGE
========================================= */

router.post("/message", auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user.id;

    // cari conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation tidak ditemukan" });
    }

    // tentukan receiver otomatis
    const receiverId = conversation.participants.find(
      (id) => id.toString() !== senderId
    );

    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      text
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageAt: new Date()
    });

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error.message);
    res.status(500).json({ success: false });
  }
});

/* =========================================
   3️⃣ AMBIL SEMUA MESSAGE DALAM 1 CONVERSATION
========================================= */

router.get("/message/:conversationId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error("GET MESSAGE ERROR:", error.message);
    res.status(500).json({ success: false });
  }
});

/* =========================================
   4️⃣ AMBIL SEMUA CONVERSATION MILIK USER
========================================= */

router.get("/conversation", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate("participants", "name role")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error.message);
    res.status(500).json({ success: false });
  }
});

module.exports = router;