const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/crypto", require("./routes/crypto")); // 👈 TAMBAHAN

app.listen(5000, () => {
  console.log("Server berjalan di http://localhost:5000");
});