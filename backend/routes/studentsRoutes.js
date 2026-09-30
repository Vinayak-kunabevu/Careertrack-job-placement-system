const express = require("express");
const Student = require("../models/student");

const router = express.Router();

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

// Create a new student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student",
      error: error.message,
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