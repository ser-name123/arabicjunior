import mongoose from "mongoose";

const studentRegistrationSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      maxLength: [50, "First name must be less than 50 characters"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      maxLength: [50, "Last name must be less than 50 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
    },
    class_grade: {
      type: Number,
      required: [true, "Please select a grade"],
      min: [1, "Minimum grade is 1"],
      max: [12, "Maximum grade is 12"],
    },
    school_name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
      minLength: [5, "School name must be at least 5 characters"],
      maxLength: [100, "School name must be under 100 characters"],
    },
    curriculum: {
      type: String,
      required: [true, "Please select a curriculum"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required"],
    },
    class_type: {
      type: String,
      enum: ["individual", "group"],
      required: [true, "Please select a class type"],
    },
    pricing_package: {
      type: String,
      required: [true, "Please select a pricing package"],
    },
    class_start_date: {
      type: Date,
      required: [true, "Class start date is required"],
      validate: {
        validator: function (v: Date) {
          return v >= new Date();
        },
        message: "Class start date cannot be in the past",
      },
    },
    preferred_time: {
      type: String,
      required: [true, "Please select a preferred time"],
    },
    preferred_days: {
      type: [String],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Please select at least one day",
      },
    },
  },
  { timestamps: true }
);

const StudentRegistration = mongoose.model(
  "studentRegistration",
  studentRegistrationSchema
);

export default StudentRegistration;
