const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    authorName: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "mentor"],
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String, // URL gambar (jika ada)
      default: null
    },

    file: {
      type: String, // URL file (pdf dll)
      default: null
    },

    link: {
      type: String, // optional external link
      default: null
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    totalLikes: {
      type: Number,
      default: 0
    },

    commentsCount: {
      type: Number,
      default: 0
    },

    isPinned: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunityPost", communityPostSchema);