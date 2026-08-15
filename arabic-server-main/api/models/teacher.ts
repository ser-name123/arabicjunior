import mongoose, { Schema, Document } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  profession: string;

  /** Square headshot. Used by every surface that shows this teacher. */
  image: string;
  imagePublicId?: string;

  /**
   * Optional full-length portrait for the About Us carousel, whose cards are
   * tall. A headshot still renders there, just smaller — this is the difference
   * between "acceptable" and "designed".
   */
  portrait?: string;
  portraitPublicId?: string;

  grade: string;
  experience: string;
  education: string;
  subject: string;
  shortDescription: string;
  rating: number;

  /** The homepage slider is a highlight reel, not the full roster. */
  showOnHomepage: boolean;

  status: "draft" | "published";
  order: number;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    profession: { type: String, required: true, trim: true, default: "Arabic Teacher" },

    image: { type: String, required: true },
    imagePublicId: { type: String },

    portrait: { type: String },
    portraitPublicId: { type: String },

    grade: { type: String, trim: true, default: "1-10" },
    experience: { type: String, trim: true, default: "" },
    education: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "Arabic" },
    shortDescription: { type: String, trim: true, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },

    showOnHomepage: { type: Boolean, default: true },

    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Serves both public queries: the full roster and the homepage subset.
TeacherSchema.index({ status: 1, order: 1, createdAt: -1 });
TeacherSchema.index({ status: 1, showOnHomepage: 1, order: 1 });

const Teacher = mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
