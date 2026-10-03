const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    branch: {
  type: String,
  required: function () {
    return this.role === "student";
  },
},

cgpa: {
  type: Number,
  required: function () {
    return this.role === "student";
  },
},

    skills: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;