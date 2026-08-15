import mongoose, { Document, Types } from "mongoose";

export interface StatItem {
  key: string;
  value: string;
  label: string;
  desc: string;
}

export interface AcademyStatsDocument extends Document {
  heading: string;
  subHeading: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  stats: StatItem[];
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const statItemSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  desc: { type: String, required: true },
});

const academyStatsSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, default: "Growing Together." },
    subHeading: { type: String, required: true, default: "Learning Without Limits." },
    description: {
      type: String,
      required: true,
      default:
        "Thousands of students across the UAE and beyond trust Arabic Juniors for quality Arabic education and excellent learning experience.",
    },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    stats: {
      type: [statItemSchema],
      default: [
        {
          key: "students",
          value: "3,500+",
          label: "Happy Students",
          desc: "Students from different schools learning Arabic with confidence.",
        },
        {
          key: "teachers",
          value: "200+",
          label: "Expert Teachers",
          desc: "Qualified and experienced Arabic teachers dedicated to your success.",
        },
        {
          key: "classes",
          value: "25,000+",
          label: "Classes Conducted",
          desc: "Interactive live classes delivered with engaging and effective methods.",
        },
        {
          key: "schools",
          value: "50+",
          label: "Students from Schools",
          desc: "Students from various schools across the UAE and beyond.",
        },
      ],
    },
  },
  { timestamps: true }
);

const AcademyStats = mongoose.model<AcademyStatsDocument>("AcademyStats", academyStatsSchema);
export default AcademyStats;
