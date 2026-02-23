const express = require("express");
const router = express.Router();
const { createNilai } = require("../controllers/nilaiController");

router.post("/", createNilai);

module.exports = router;