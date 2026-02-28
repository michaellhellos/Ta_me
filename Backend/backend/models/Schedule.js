const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
    {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: String,
        date: {
            type: Date,
            required: true,
        },
        zoomLink: {
            type: String,
            required: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
