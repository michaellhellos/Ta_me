const express = require("express");
const router = express.Router();
const { createNilai, getNilaiByUser, redeemXp } = require("../controllers/nilaiController");

router.post("/", createNilai);
router.post("/redeem", redeemXp);
router.get("/user/:userId", getNilaiByUser);

module.exports = router;