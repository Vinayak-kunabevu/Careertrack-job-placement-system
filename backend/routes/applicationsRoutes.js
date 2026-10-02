
const express = require("express");
const router = express.Router();

const Application = require("../models/application");
const Job = require("../models/job");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

// Get applications for the logged-in student
router.get("/my", verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.studentId,
    })
      .populate("job", "company role location package deadline")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);

    res.status(500).json({
      message: "Error fetching applications",
    });
  }
});

// Apply for a job with a PDF resume
router.post(
  "/:jobId",
  verifyToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      // Check whether a resume was uploaded
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload your resume in PDF format",
        });
      }

      // Find the job
      const job = await Job.findById(req.params.jobId);

      if (!job) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      // Prevent duplicate applications
      const existingApplication = await Application.findOne({
        student: req.studentId,
        job: job._id,
      });

      if (existingApplication) {
        return res.status(409).json({
          message: "You have already applied for this job",
        });
      }

      // Upload the PDF resume to Cloudinary
      const resumeUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "careertrack/resumes",
            resource_type: "raw",
            type: "upload",
            public_id: `resume-${req.studentId}-${job._id}-${Date.now()}.pdf`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      // Save the application in MongoDB
      const application = await Application.create({
        student: req.studentId,
        job: job._id,
        resumeUrl,
      });

      // Send success response
      res.status(201).json({
        message: "Application submitted successfully",
        application,
      });
    } catch (error) {
      console.error("Application submission error:", error);

      res.status(500).json({
        message: "Error submitting application",
      });
    }
  }
);

module.exports = router;

