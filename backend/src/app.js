const express = require("express");
const connectDB = require("./db/db");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessions");
const attendanceRoutes = require("./routes/attendance");
const analyticsRoutes = require("./routes/analytics");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;
