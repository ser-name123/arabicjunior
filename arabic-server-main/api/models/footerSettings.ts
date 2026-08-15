import mongoose, { Document, Schema } from "mongoose";

export interface FooterSettingsDocument extends Document {
  description: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  instagram: string;
  phone: string;
  phoneLink: string;
  email: string;
  location: string;
  copyright: string;
}

const footerSettingsSchema = new Schema<FooterSettingsDocument>(
  {
    description: {
      type: String,
      default: "Learn Arabic online with expert UAE syllabus tutors, offering affordable one-to-one and group classes in conversational and Modern Standard Arabic."
    },
    facebook: { type: String, default: "https://facebook.com" },
    linkedin: { type: String, default: "https://linkedin.com" },
    youtube: { type: String, default: "https://youtube.com" },
    instagram: { type: String, default: "https://instagram.com" },
    phone: { type: String, default: "+971 50 534 4645" },
    phoneLink: { type: String, default: "https://wa.me/971505344645?text=Hello!%20I'm%20interested%20in%20enrolling%20in%20Arabic%20tuition%20classes.%20Please%20get%20in%20touch%20with%20me." },
    email: { type: String, default: "hello@arabicjuniors.com" },
    location: { type: String, default: "Dubai - United Arab Emirates" },
    copyright: { type: String, default: "©2026 www.arabicjuniors.com | All Rights Reserved by The Learning Hub FZE LLC" }
  },
  { timestamps: true }
);

export default mongoose.models.FooterSettings || mongoose.model<FooterSettingsDocument>("FooterSettings", footerSettingsSchema);
