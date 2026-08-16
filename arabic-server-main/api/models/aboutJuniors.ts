import mongoose, { Schema, Document } from "mongoose";

export interface AboutJuniorsDocument extends Document {
  badgeText: string;
  heading: string;
  headingHighlight: string;
  headingSuffix: string;
  imageUrl: string;
  imagePublicId?: string;
  featureCards: Array<{ title: string; desc: string; icon: string }>;
  bottomCards: Array<{ title: string; desc: string; icon: string }>;
}

const aboutJuniorsSchema = new Schema<AboutJuniorsDocument>(
  {
    badgeText: { type: String, default: "About Arabic Juniors" },
    heading: { type: String, default: "Making" },
    headingHighlight: { type: String, default: "Arabic" },
    headingSuffix: { type: String, default: "Learning Simple, Engaging & Accessible" },
    imageUrl: { type: String, default: "/free_trial_banner_student.png" },
    imagePublicId: { type: String, default: "" },
    featureCards: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true },
        icon: { type: String, required: true },
      },
    ],
    bottomCards: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true },
        icon: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<AboutJuniorsDocument>("AboutJuniors", aboutJuniorsSchema);
