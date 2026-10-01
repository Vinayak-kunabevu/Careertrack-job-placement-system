const express = require("express");
const Student = require("../models/student");

const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get all students

router.get("/", async (req, res) => {
  try {
    const students = await Student.find().select("-password");

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

// Create a new student

const bcrypt = require("bcrypt");


const jwt = require("jsonwebtoken");

// Student login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find student by email
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      student.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Exclude password hash from response
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
      error: error.message,
    });
  }
});
// Register a new student
router.post("/", async (req, res) => {
  try {
    const { name, email, password, branch, cgpa, skills } = req.body;

    // Check required fields
    if (!name || !email || !password || !branch || cgpa === undefined) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check whether the email already exists
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student with hashed password
    const student = new Student({
      name,
      email,
      password: hashedPassword,
      branch,
      cgpa,
      skills,
    });

    const savedStudent = await student.save();

    // Never send the password hash in the response
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


router.get("/profile", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId)
      .select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
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

// Update a student
router.put("/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
});

// Delete a student
router.delete("/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
      student: deletedStudent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
});
module.exports = router;