export type TestimonialType = "text" | "video";
export type VideoSource = "link" | "upload";

export interface Testimonial {
  _id: string;
  type: TestimonialType;
  authorName: string;
  profession: string;
  comment?: string;
  rating: number;

  /**
   * Either a path inside public/ (the three testimonials that predate the
   * admin screen) or a full Cloudinary URL. next/image accepts both.
   */
  image?: string;
  imagePublicId?: string;

  videoSource?: VideoSource;
  /** YouTube/Vimeo watch link, or the Cloudinary URL of an uploaded file. */
  videoUrl?: string;
  /** Set only for `link` videos — goes into an iframe. */
  videoEmbedUrl?: string;
  videoThumbnail?: string;
  videoPublicId?: string;

  status: "draft" | "published";
  order: number;
  createdAt: string;
  updatedAt: string;
}
