
const express = require("express");
const router = express.Router();

const Job = require("../models/job");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/authMiddleware").verifyAdmin;

// Get all jobs (public access)
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);

    res.status(500).json({
      message: "Error fetching jobs",
    });
  }
});

// Add a new job (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
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

// Update a job (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating job",
      error: error.message,
    });
  }
});

// Delete a job (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error deleting job",
      error: error.message,
    });
  }
});

module.exports = router;