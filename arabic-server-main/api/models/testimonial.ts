import mongoose, { Schema, Document } from "mongoose";

export type TestimonialType = "text" | "video";
export type VideoSource = "link" | "upload";

export interface ITestimonial extends Document {
  type: TestimonialType;
  authorName: string;
  profession: string;
  comment?: string;
  rating: number;

  /** Author photo. Optional for videos, where the poster frame stands in. */
  image?: string;
  imagePublicId?: string;

  videoSource?: VideoSource;
  /** The link the admin pasted, or the Cloudinary URL of the uploaded file. */
  videoUrl?: string;
  /** iframe src — only set for `link` testimonials. */
  videoEmbedUrl?: string;
  videoThumbnail?: string;
  videoPublicId?: string;

  status: "draft" | "published";
  /** Ascending. Lets the admin pin the strongest testimonials to the front. */
  order: number;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    type: { type: String, enum: ["text", "video"], required: true, default: "text" },
    authorName: { type: String, required: true, trim: true },
    profession: { type: String, required: true, trim: true, default: "Parent" },
    comment: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },

    image: { type: String },
    imagePublicId: { type: String },

    videoSource: { type: String, enum: ["link", "upload"] },
    videoUrl: { type: String },
    videoEmbedUrl: { type: String },
    videoThumbnail: { type: String },
    videoPublicId: { type: String },

    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Enforced here as well as in the controller so a bad document cannot be
// written by a script or a future code path that skips the controller.
TestimonialSchema.pre("validate", function (next) {
  if (this.type === "text" && !this.comment?.trim()) {
    return next(new Error("A text testimonial needs a comment"));
  }
  if (this.type === "video" && !this.videoUrl?.trim()) {
    return next(new Error("A video testimonial needs a video link or file"));
  }
  next();
});

// The homepage query is {status:'published'} sorted by order then newest —
// this index serves it end to end.
TestimonialSchema.index({ status: 1, order: 1, createdAt: -1 });

const Testimonial = mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;
