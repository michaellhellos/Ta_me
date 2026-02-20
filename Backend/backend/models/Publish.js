const mongoose = require("mongoose");

const publishSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    summary: String,

    quizzes: [
      {
        question: String,
        options: [String], // 🔥 SUPPORT 4 OPSI
        correctAnswer: Number
      }
    ],

    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Publish", publishSchema);