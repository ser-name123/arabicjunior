export interface Teacher {
  _id: string;
  name: string;
  profession: string;

  /**
   * Either a path inside public/ (the teachers that predate the admin screen)
   * or a full Cloudinary URL. next/image accepts both.
   */
  image: string;
  imagePublicId?: string;

  /** Full-length photo for the About Us carousel; falls back to `image`. */
  portrait?: string;
  portraitPublicId?: string;

  grade: string;
  experience: string;
  education: string;
  subject: string;
  shortDescription: string;
  rating: number;

  showOnHomepage: boolean;
  status: "draft" | "published";
  order: number;
  createdAt: string;
  updatedAt: string;
}
