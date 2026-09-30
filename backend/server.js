
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const studentsRoutes = require("./routes/studentsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/students", studentsRoutes);

app.get("/api/hello", (req, res) => {
  res.send("API route is working");
});

app.post("/api/testpost", (req, res) => {
  res.json({
    message: "POST route is working",
    data: req.body
  });
});
// MongoDB Atlas connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });

// Test route
app.get("/", (req, res) => {
  res.send("CareerTrack Backend API is running");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from CareerTrack Backend!"
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});