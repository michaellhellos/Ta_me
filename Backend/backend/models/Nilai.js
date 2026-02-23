const mongoose = require("mongoose");

const nilaiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    materiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Materi",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalSoal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // otomatis createdAt & updatedAt
  }
);

module.exports = mongoose.model("Nilai", nilaiSchema);