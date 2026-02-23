const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    type: {
      type: String,
      enum: ["image", "file"],
      required: true
    }
  },
  { _id: false }
);

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

    // NEW: structured attachments array
    attachments: {
      type: [attachmentSchema],
      default: []
    },

    // DEPRECATED — kept for backward compat
    image: {
      type: String,
      default: null
    },

    file: {
      type: String,
      default: null
    },

    link: {
      type: String,
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