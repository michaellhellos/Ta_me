// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");
// require("dotenv").config();
// const app = express();
// connectDB();

// app.use(cors());
// app.use(express.json());

// // ROUTES
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/crypto", require("./routes/crypto")); // 👈 TAMBAHAN
// app.use("/api/transaction", require("./routes/transaction"));
// app.use("/api/user", require("./routes/user"));
// app.use("/api/trade", require("./routes/trade"));
// app.use("/api/mentor", require("./routes/mentor"));
// app.use("/api/materi", require("./routes/Materi"));
// app.use("/api/chat", require("./routes/chatRoutes"));

// app.listen(5000, () => {
//   console.log("Server berjalan di http://localhost:5000");
// });




const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/Message");
require("dotenv").config();

const app = express();
connectDB();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   API TRACKING MIDDLEWARE
========================= */
const ApiStat = require("./models/ApiStat");

app.use("/api", (req, res, next) => {
  res.on("finish", async () => {
    try {
      // Create local date string (YYYY-MM-DD)
      const today = new Date().toLocaleDateString('en-CA');
      await ApiStat.findOneAndUpdate(
        { date: today },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("API STAT TRACKING ERROR:", err.message);
    }
  });
  next();
});

/* =========================
   ROUTES (TIDAK DIUBAH)
========================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/crypto", require("./routes/crypto"));
app.use("/api/transaction", require("./routes/transaction"));
app.use("/api/user", require("./routes/user"));
app.use("/api/trade", require("./routes/trade"));
app.use("/api/mentor", require("./routes/mentor"));
app.use("/api/materi", require("./routes/Materi"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/nilai", require("./routes/nilaiRoutes"));
app.use("/api/community", require("./routes/community"));
app.use("/api/schedule", require("./routes/schedule"));
app.use("/api/admin", require("./routes/admin"));

/* =========================
   SOCKET.IO SETUP
========================= */

// Buat server dari express
const server = http.createServer(app);

// Pasang socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // sementara untuk development
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Join ke room conversation
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Kirim pesan real-time (socket.to = exclude sender → no duplicate)
  socket.on("send_message", (data) => {
    socket.to(data.conversationId).emit("receive_message", data);
  });

  // Update status read — persist ke DB
  socket.on("message_read", async (data) => {
    try {
      if (data.messageId) {
        await Message.findByIdAndUpdate(data.messageId, { isRead: true });
      }
    } catch (err) {
      console.error("READ UPDATE ERROR:", err.message);
    }
    io.to(data.conversationId).emit("message_read_update", data);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("user_typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.conversationId).emit("user_stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

/* =========================
   START SERVER
========================= */

// Vercel serverless: export app, don't listen
// Local dev: start HTTP server with Socket.IO
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}