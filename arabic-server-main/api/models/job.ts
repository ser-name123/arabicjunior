import mongoose, { Schema, Document, Types } from "mongoose";

export interface IResponsibility {
  category: string;
  items: string[];
}

export interface IJob extends Document {
  title: string;
  slug: string;
  department: string;
  jobLocation: string;
  employmentType: string;
  jobType: string;
  experience: string;
  schedule: string;
  description: string;
  responsibilities: IResponsibility[];
  applyLabel: string;
  applyUrl: string;
  status: "draft" | "published";
  order: number;
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const responsibilitySchema = new Schema({
  category: { type: String, default: "" },
  items: { type: [String], default: [] },
});

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    department: { type: String, required: true, default: "Management" },
    jobLocation: { type: String, required: true, default: "Online" },
    employmentType: { type: String, required: true, default: "Permanent" },
    jobType: { type: String, required: true }, // e.g. "3 years exp."
    experience: { type: String, required: true }, // e.g. "Minimum 1-2 Years"
    schedule: { type: String, required: true, default: "Flexible Hours" },
    description: { type: String, required: true },
    responsibilities: { type: [responsibilitySchema], default: [] },
    applyLabel: { type: String, required: true, default: "Apply Now" },
    applyUrl: { type: String, required: true, default: "/teacher-registration" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = mongoose.model<IJob>("Job", jobSchema);
export default Job;
