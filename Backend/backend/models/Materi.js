const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String], // 🔥 array string (bisa 4,5,6 opsi)
    required: true,
    validate: {
      validator: function (v) {
        return v.length >= 2;
      },
      message: "Minimal 2 opsi jawaban"
    }
  },
  correctAnswer: {
    type: Number,
    required: true
  }
});

const materiSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    summary: String,
    quizzes: [quizSchema],
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Materi", materiSchema);