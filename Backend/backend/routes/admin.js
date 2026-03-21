const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Nilai = require("../models/Nilai");
const ApiStat = require("../models/ApiStat");

// GET /api/admin/dashboard-stats
router.get("/dashboard-stats", async (req, res) => {
  try {
    const [topBuyers, topSellers, topQuiz, apiTraffic] = await Promise.all([
      // 1. TOP BUYERS
      Transaction.aggregate([
        { $match: { type: "BUY" } },
        { 
          $group: { 
            _id: "$userId", 
            count: { $sum: 1 }, 
            volume: { $sum: "$total" } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { 
          $lookup: { 
            from: "users", 
            localField: "_id", 
            foreignField: "_id", 
            as: "user" 
          } 
        },
        { $unwind: "$user" },
        { 
          $project: { 
            name: "$user.name", 
            email: "$user.email", 
            count: 1, 
            volume: 1 
          } 
        }
      ]),
      
      // 2. TOP SELLERS
      Transaction.aggregate([
        { $match: { type: "SELL" } },
        { 
          $group: { 
            _id: "$userId", 
            count: { $sum: 1 }, 
            volume: { $sum: "$total" } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { 
          $lookup: { 
            from: "users", 
            localField: "_id", 
            foreignField: "_id", 
            as: "user" 
          } 
        },
        { $unwind: "$user" },
        { 
          $project: { 
            name: "$user.name", 
            email: "$user.email", 
            count: 1, 
            volume: 1 
          } 
        }
      ]),
      
      // 3. TOP QUIZ RESPONDENTS
      Nilai.aggregate([
        { 
          $group: { 
            _id: "$userId", 
            quizzesTaken: { $sum: 1 }, 
            maxScore: { $max: "$score" } 
          } 
        },
        { $sort: { quizzesTaken: -1 } },
        { $limit: 5 },
        { 
          $lookup: { 
            from: "users", 
            localField: "_id", 
            foreignField: "_id", 
            as: "user" 
          } 
        },
        { $unwind: "$user" },
        { 
          $project: { 
            name: "$user.name", 
            quizzesTaken: 1, 
            maxScore: 1 
          } 
        }
      ]),
      
      // 4. API TRAFFIC (LAST 7 DAYS)
      ApiStat.find()
        .sort({ date: -1 })
        .limit(7)
        .then(docs => docs.reverse()) // Reverse so oldest is first
    ]);

    res.json({
      success: true,
      data: {
        topBuyers,
        topSellers,
        topQuiz,
        apiTraffic
      }
    });

  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
