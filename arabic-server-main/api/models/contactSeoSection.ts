import mongoose, { Schema, Document } from "mongoose";

/**
 * The "Arabic Tuition for Kids Near Me" block under the contact form.
 *
 * A single document, like the other section settings. There is only ever one
 * of these on the site, so a collection of many would just invite the question
 * of which one is live.
 */

export interface ContactSeoItem {
  title: string;
  description: string;
  /**
   * Name of a lucide icon. Kept as a string because the admin screen picks from
   * a fixed list and the component maps the name to the real icon — storing a
   * component is not something a database can do.
   */
  icon: string;
  /**
   * A colour name, not a CSS class. The page owns the actual palette, so the
   * tints stay consistent even if someone picks "green" for all six, and an
   * admin never has to know what `bg-light-green-100` means.
   */
  iconTheme: string;
  order: number;
}

export interface ContactSeoSectionDocument extends Document {
  heading: string;
  introText: string;
  items: ContactSeoItem[];
  ctaHeading: string;
  ctaSubtext: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
}

const itemSchema = new Schema<ContactSeoItem>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "GraduationCap", trim: true },
    iconTheme: { type: String, default: "green", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const contactSeoSectionSchema = new Schema<ContactSeoSectionDocument>(
  {
    heading: { type: String, default: "", trim: true },
    introText: { type: String, default: "", trim: true },
    items: { type: [itemSchema], default: [] },
    ctaHeading: { type: String, default: "", trim: true },
    ctaSubtext: { type: String, default: "", trim: true },
    ctaButtonLabel: { type: String, default: "", trim: true },
    ctaButtonUrl: { type: String, default: "/register", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ContactSeoSectionDocument>(
  "ContactSeoSection",
  contactSeoSectionSchema
);
