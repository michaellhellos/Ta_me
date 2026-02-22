const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/crypto", require("./routes/crypto")); // 👈 TAMBAHAN
app.use("/api/transaction", require("./routes/transaction"));
app.use("/api/user", require("./routes/user"));
app.use("/api/trade", require("./routes/trade"));
app.use("/api/mentor", require("./routes/mentor"));
app.use("/api/materi", require("./routes/Materi"));
app.use("/api/chat", require("./routes/chatRoutes"));

app.listen(5000, () => {
  console.log("Server berjalan di http://localhost:5000");
});