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
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
connectDB();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

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

  // Kirim pesan real-time
  socket.on("send_message", (data) => {
    io.to(data.conversationId).emit("receive_message", data);
  });

  // Update status read
  socket.on("message_read", (data) => {
    io.to(data.conversationId).emit("message_read_update", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});