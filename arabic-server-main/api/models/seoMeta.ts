import mongoose, { Schema, Document } from "mongoose";

export interface SeoMetaDocument extends Document {
  /** Stable identifier the page asks for. Never change it once live. */
  pageKey: string;
  /** Human name shown in the admin list. */
  label: string;
  /** The route this record describes, for the admin list only. */
  path: string;
  title: string;
  description: string;
  /**
   * The address search engines should treat as this page's canonical home.
   * It does not change the route the site actually serves.
   */
  canonicalUrl: string;
  keywords: string[];
  /** Tells search engines to leave the page out of their index. */
  noIndex: boolean;
}

const seoMetaSchema = new Schema<SeoMetaDocument>(
  {
    pageKey: { type: String, required: true, unique: true, trim: true, index: true },
    label: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    canonicalUrl: { type: String, default: "", trim: true },
    keywords: { type: [String], default: [] },
    noIndex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<SeoMetaDocument>("SeoMeta", seoMetaSchema);
