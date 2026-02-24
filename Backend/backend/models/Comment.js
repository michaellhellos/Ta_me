const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CommunityPost",
            required: true,
            index: true
        },

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
            enum: ["user", "mentor", "admin"],
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);
