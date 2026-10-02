
const express = require("express");
const router = express.Router();
const Job = require("../models/job");

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching jobs",
    });
  }
});

// Add a new job
router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      message: "Job added successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error adding job",
      error: error.message,
    });
  }
});

module.exports = router;