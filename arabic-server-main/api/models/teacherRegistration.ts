import mongoose from "mongoose";

const langValues = [
  "eng",
  "urdu",
  "hindi",
  "malayalam",
  "tamil",
  "philippine",
  "bengali",
  "french",
  "german",
] as const;

export type LangType = (typeof langValues)[number];

export interface TeacherRegistrationDocument extends mongoose.Document {
  first_name: string;
  last_name: string;
  gender: "Male" | "Female" | "Custom";
  email: string;
  country_code?: string;
  whatsapp_number?: string;
  address: string;
  where_live: string;
  birth: string;
  materials_status: "Married" | "Unmarried";
  nationality: string;
  occupation: string;
  introduce_yourself: string;
  fb_id: string;
  personal_image: string; // Cloudinary URL
  education: string;
  teaching_experience: string;
  mother_lang: LangType;
  other_langs?: LangType[];
  doc_1?: string; // Cloudinary URLs
  doc_2?: string;
  doc_3?: string;
  doc_4?: string;
  preferred_interview_time: "morning" | "afternoon" | "evening";
  expected_salary: number;
  work_hours: number;
  employment_desire: "full-time" | "part-time" | "full-part";
  what_make_ideal: string;
  how_find_us:
  | "facebook"
  | "linkedin"
  | "google"
  | "al-furqan"
  | "advertisement"
  | "other";
  declaration: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TeacherRegistrationSchema = new mongoose.Schema<TeacherRegistrationDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Custom"], required: true },
    email: { type: String, required: true },
    country_code: { type: String },
    whatsapp_number: { type: String },
    address: { type: String, required: true },
    where_live: { type: String, required: true },
    birth: { type: String, required: true },
    materials_status: { type: String, enum: ["Married", "Unmarried"], required: true },
    nationality: { type: String, required: true },
    occupation: { type: String, required: true },
    introduce_yourself: { type: String, required: true },
    fb_id: { type: String, required: true },
    personal_image: { type: String, required: true }, // Cloudinary URL
    education: { type: String, required: true },
    teaching_experience: { type: String, required: true },
    mother_lang: { type: String, enum: langValues, required: true },
    other_langs: { type: [String], enum: langValues },
    doc_1: { type: String },
    doc_2: { type: String },
    doc_3: { type: String },
    doc_4: { type: String },
    preferred_interview_time: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },
    expected_salary: { type: Number, required: true },
    work_hours: { type: Number, required: true },
    employment_desire: {
      type: String,
      enum: ["full-time", "part-time", "full-part"],
      required: true,
    },
    what_make_ideal: { type: String, required: true },
    how_find_us: {
      type: String,
      enum: ["facebook", "linkedin", "google", "al-furqan", "advertisement", "other"],
      required: true,
    },
    declaration: { type: Boolean, required: true },
  },
  { timestamps: true }
);


const TeacherRegistration = mongoose.model("TeacherRegistration", TeacherRegistrationSchema);

export default TeacherRegistration;
