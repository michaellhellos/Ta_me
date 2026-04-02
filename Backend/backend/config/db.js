// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect("mongodb://127.0.0.1:27017/MyTa");
//     console.log("MongoDB Connected");
//   } catch (error) {
//     console.log("Database error:", error);
//   }
// };

// module.exports = connectDB;
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "myDatabase" // 🔥 PENTING BANGET
    });

    console.log("MongoDB Connected");
    console.log("Database:", conn.connection.name); // 🔥 debug

  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;