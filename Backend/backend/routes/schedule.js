const router = require("express").Router();
const Schedule = require("../models/Schedule");
const auth = require("../middleware/auth");

// =======================
// CREATE SCHEDULE (mentor only)
// =======================
router.post("/", auth, async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({ message: "Hanya mentor yang bisa membuat jadwal" });
        }

        const { title, description, date, zoomLink } = req.body;

        if (!title || !date || !zoomLink) {
            return res.status(400).json({ message: "Title, date, dan zoomLink wajib diisi" });
        }

        const schedule = new Schedule({
            mentorId: req.user._id,
            title,
            description: description || "",
            date: new Date(date),
            zoomLink,
        });

        await schedule.save();
        res.json({ success: true, data: schedule });
    } catch (err) {
        console.error("CREATE SCHEDULE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// GET MY SCHEDULES (mentor only)
// =======================
router.get("/mentor", auth, async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({ message: "Hanya mentor" });
        }

        const schedules = await Schedule.find({ mentorId: req.user._id })
            .sort({ date: -1 });

        res.json({ success: true, data: schedules });
    } catch (err) {
        console.error("GET MY SCHEDULES ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// GET UPCOMING SCHEDULES (public/all users)
// =======================
router.get("/upcoming", async (req, res) => {
    try {
        const schedules = await Schedule.find({
            isPublished: true,
            date: { $gte: new Date() },
        })
            .populate("mentorId", "name specialization")
            .sort({ date: 1 });

        res.json({ success: true, data: schedules });
    } catch (err) {
        console.error("GET UPCOMING ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// DELETE SCHEDULE (mentor only, own schedule)
// =======================
router.delete("/:id", auth, async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ message: "Jadwal tidak ditemukan" });
        }

        if (schedule.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Tidak bisa menghapus jadwal mentor lain" });
        }

        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Jadwal berhasil dihapus" });
    } catch (err) {
        console.error("DELETE SCHEDULE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
