
const express = require("express");
const Student = require("../models/student");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/authMiddleware").verifyAdmin;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Get all students (admin only)
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

// Student login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      student.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: student.role || "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json({
      message: "Login successful",
      token,
      student: studentResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
    });
  }
});

// Register a new student
router.post("/", async (req, res) => {
  try {
    const { name, email, password, branch, cgpa, skills } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !branch ||
      cgpa === undefined ||
      cgpa === null ||
      cgpa === ""
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      password: hashedPassword,
      branch,
      cgpa,
      skills,
      role: "student",
    });

    const savedStudent = await student.save();

    const studentResponse = savedStudent.toObject();
    delete studentResponse.password;

    res.status(201).json({
      message: "Student registered successfully",
      student: studentResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Get logged-in user's profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId)
      .select("-password");

    if (!student) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile fetched successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

// Update a student (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Prevent changing a user's role through this endpoint.
    const { role, password, ...updates } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password");

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
});

// Delete a student (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete student",
    });
  }
});

module.exports = router;