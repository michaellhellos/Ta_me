const express = require("express");
const router = express.Router();
const { createNilai, getNilaiByUser } = require("../controllers/nilaiController");

router.post("/", createNilai);
router.get("/user/:userId", getNilaiByUser);

module.exports = router;