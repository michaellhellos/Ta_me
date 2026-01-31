const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/MyTa");
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Database error:", error);
  }
};

module.exports = connectDB;
