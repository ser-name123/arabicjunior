import mongoose, { Schema, Document } from "mongoose";

export interface FaqItem {
  question: string;
  /** Stored as HTML so answers can carry links; sanitised before rendering. */
  answer: string;
  order: number;
}

export interface FaqSectionDocument extends Document {
  heading: string;
  headingHighlight: string;
  introLines: string[];
  imageUrl: string;
  imagePublicId?: string;
  personName: string;
  personLabel: string;
  items: FaqItem[];
}

const faqSectionSchema = new Schema<FaqSectionDocument>(
  {
    heading: { type: String, default: "We are often" },
    headingHighlight: { type: String, default: "Asked" },
    introLines: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    personName: { type: String, default: "John Paul" },
    personLabel: { type: String, default: "Student Grade 4" },
    items: [
      {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<FaqSectionDocument>("FaqSection", faqSectionSchema);
