import { Request, Response } from "express";
import Testimonial, { ITestimonial } from "../models/testimonial";
import { parseVideoUrl } from "../utils/videoUrl";
import { containsRegex } from "../utils/escapeRegex";
import {
  uploadBuffer,
  destroyQuietly,
  videoPosterUrl,
  UploadedAsset as Uploaded,
} from "../utils/cloudinaryUpload";
import { MAX_IMAGE_SIZE } from "../config/upload";

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

const uploadToCloudinary = (
  file: Express.Multer.File,
  resourceType: "image" | "video"
) => uploadBuffer(file, "testimonials", resourceType);

const IMAGE_MIME = /^image\//;
const VIDEO_MIME = /^video\//;

/**
 * Shared field handling for create and update. Returns either the fields to
 * write or a message to send back with a 400.
 */
const buildFields = async (
  req: Request,
  uploaded: Uploaded[],
  existing?: ITestimonial
): Promise<{ error: string } | { fields: Partial<ITestimonial> }> => {
  const files = req.files as MulterFiles;
  const body = req.body as Record<string, unknown>;

  const asString = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string).trim() : undefined;

  const type = (asString("type") ?? existing?.type ?? "text") as ITestimonial["type"];
  if (type !== "text" && type !== "video") {
    return { error: "Type must be either 'text' or 'video'" };
  }

  const fields: Partial<ITestimonial> = { type };

  const authorName = asString("authorName") ?? existing?.authorName;
  if (!authorName) return { error: "Author name is required" };
  fields.authorName = authorName;

  fields.profession = asString("profession") ?? existing?.profession ?? "Parent";

  const rating = Number(asString("rating") ?? existing?.rating ?? 5);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be a whole number between 1 and 5" };
  }
  fields.rating = rating;

  const order = Number(asString("order") ?? existing?.order ?? 0);
  if (!Number.isFinite(order)) return { error: "Order must be a number" };
  fields.order = order;

  const status = asString("status") ?? existing?.status ?? "draft";
  if (status !== "draft" && status !== "published") {
    return { error: "Status must be either 'draft' or 'published'" };
  }
  fields.status = status;

  // --- author photo ------------------------------------------------------
  const photo = files?.["photo"]?.[0];
  if (photo) {
    if (!IMAGE_MIME.test(photo.mimetype)) {
      return { error: "The photo field must be an image" };
    }
    // The multer instance is configured at the video ceiling, so the image
    // limit has to be enforced here.
    if (photo.size > MAX_IMAGE_SIZE) {
      return { error: "Photo is too large (maximum 5 MB)" };
    }
    const result = await uploadToCloudinary(photo, "image");
    uploaded.push(result);
    fields.image = result.secure_url;
    fields.imagePublicId = result.public_id;
  }

  // --- text testimonial --------------------------------------------------
  if (type === "text") {
    const comment = asString("comment") ?? (existing?.type === "text" ? existing.comment : undefined);
    if (!comment) return { error: "A text testimonial needs a comment" };
    fields.comment = comment;

    // Switching an existing video testimonial to text clears the video side so
    // the card does not render a stale play button.
    fields.videoSource = undefined;
    fields.videoUrl = undefined;
    fields.videoEmbedUrl = undefined;
    fields.videoThumbnail = undefined;
    fields.videoPublicId = undefined;
    return { fields };
  }

  // --- video testimonial -------------------------------------------------
  // A quote alongside the video is optional.
  fields.comment = asString("comment") ?? existing?.comment;

  const videoFile = files?.["video"]?.[0];
  const videoLink = asString("videoUrl");
  const requestedSource = asString("videoSource");

  if (videoFile) {
    if (!VIDEO_MIME.test(videoFile.mimetype)) {
      return { error: "The video field must be a video file" };
    }
    const result = await uploadToCloudinary(videoFile, "video");
    uploaded.push(result);
    fields.videoSource = "upload";
    fields.videoUrl = result.secure_url;
    fields.videoPublicId = result.public_id;
    // Cloudinary can render a poster frame from the video itself.
    fields.videoThumbnail = videoPosterUrl(result.public_id);
    fields.videoEmbedUrl = undefined;
  } else if (videoLink) {
    const parsed = parseVideoUrl(videoLink);
    if (!parsed) {
      return {
        error:
          "That does not look like a YouTube or Vimeo link. Example: https://www.youtube.com/watch?v=xxxxxxxxxxx",
      };
    }
    fields.videoSource = "link";
    fields.videoUrl = parsed.watchUrl;
    fields.videoEmbedUrl = parsed.embedUrl;
    fields.videoPublicId = undefined;
    // Vimeo gives no thumbnail without an API call; a separately uploaded
    // poster, or failing that the author photo, covers it on the frontend.
    fields.videoThumbnail = parsed.thumbnail || fields.image || existing?.image;
  } else if (existing?.videoUrl && requestedSource !== "link") {
    // Editing a video testimonial without touching the video: keep what's there.
    fields.videoSource = existing.videoSource;
    fields.videoUrl = existing.videoUrl;
    fields.videoEmbedUrl = existing.videoEmbedUrl;
    fields.videoPublicId = existing.videoPublicId;
    fields.videoThumbnail = fields.image ?? existing.videoThumbnail;
  } else {
    return { error: "A video testimonial needs either a video link or an uploaded file" };
  }

  // An explicitly uploaded poster always wins.
  const poster = files?.["thumbnail"]?.[0];
  if (poster) {
    if (!IMAGE_MIME.test(poster.mimetype)) {
      return { error: "The thumbnail field must be an image" };
    }
    if (poster.size > MAX_IMAGE_SIZE) {
      return { error: "Thumbnail is too large (maximum 5 MB)" };
    }
    const result = await uploadToCloudinary(poster, "image");
    uploaded.push(result);
    fields.videoThumbnail = result.secure_url;
  }

  return { fields };
};

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/** Homepage carousel. Published only, in the order the admin chose. */
export const getPublishedTestimonials = async (_req: Request, res: Response) => {
  try {
    const testimonials = await Testimonial.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, message: "success", data: testimonials });
  } catch (error: any) {
    console.error("Error listing published testimonials:", error);
    res.status(500).json({ success: false, message: "Could not load testimonials" });
  }
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    let filter: Record<string, unknown> = {};
    if (typeof search === "string" && search.trim() !== "") {
      const regex = containsRegex(search);
      filter = { $or: [{ authorName: regex }, { profession: regex }, { comment: regex }] };
    }

    const total = await Testimonial.countDocuments(filter);
    const testimonials = await Testimonial.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      message: "success",
      data: testimonials,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error listing testimonials:", error);
    res.status(500).json({ success: false, message: "Could not load testimonials" });
  }
};

export const getTestimonialById = async (req: Request, res: Response): Promise<any> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, data: testimonial });
  } catch (error: any) {
    res.status(400).json({ success: false, message: "Invalid testimonial id" });
  }
};

export const createTestimonial = async (req: Request, res: Response): Promise<any> => {
  const uploaded: Uploaded[] = [];
  try {
    const result = await buildFields(req, uploaded);
    if ("error" in result) {
      await destroyQuietly(uploaded);
      return res.status(400).json({ success: false, message: result.error });
    }

    const testimonial = await Testimonial.create(result.fields);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error: any) {
    await destroyQuietly(uploaded);
    console.error("Error creating testimonial:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req: Request, res: Response): Promise<any> => {
  const uploaded: Uploaded[] = [];
  try {
    const existing = await Testimonial.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    // Captured before the fields are overwritten, so replaced assets can be
    // removed only after the save succeeds.
    const previous: Uploaded[] = [];
    const result = await buildFields(req, uploaded, existing);
    if ("error" in result) {
      await destroyQuietly(uploaded);
      return res.status(400).json({ success: false, message: result.error });
    }

    if (existing.imagePublicId && result.fields.imagePublicId !== existing.imagePublicId) {
      previous.push({
        public_id: existing.imagePublicId,
        secure_url: existing.image ?? "",
        resource_type: "image",
      });
    }
    if (existing.videoPublicId && result.fields.videoPublicId !== existing.videoPublicId) {
      previous.push({
        public_id: existing.videoPublicId,
        secure_url: existing.videoUrl ?? "",
        resource_type: "video",
      });
    }

    existing.set(result.fields);
    await existing.save();

    await destroyQuietly(previous);
    res.status(200).json({ success: true, data: existing });
  } catch (error: any) {
    await destroyQuietly(uploaded);
    console.error("Error updating testimonial:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST: Delete several testimonials at once (Admin Only).
 *
 * Collects every image and video first, deletes the records, then clears
 * Cloudinary — the same order the single delete uses, so a stubborn asset
 * cannot block the deletion itself.
 */
export const deleteManyTestimonials = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No testimonials selected" });
    }

    // An upper bound so one malformed request cannot wipe the list.
    if (ids.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Please delete at most 200 testimonials at a time",
      });
    }

    const testimonials = await Testimonial.find({ _id: { $in: ids } });

    const assets: Uploaded[] = [];
    for (const testimonial of testimonials) {
      if (testimonial.imagePublicId) {
        assets.push({
          public_id: testimonial.imagePublicId,
          secure_url: testimonial.image ?? "",
          resource_type: "image",
        });
      }
      if (testimonial.videoPublicId) {
        assets.push({
          public_id: testimonial.videoPublicId,
          secure_url: testimonial.videoUrl ?? "",
          resource_type: "video",
        });
      }
    }

    const result = await Testimonial.deleteMany({ _id: { $in: ids } });
    await destroyQuietly(assets);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} testimonial(s) deleted successfully!`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting testimonials:", error);
    res.status(500).json({ success: false, message: "Failed to delete the testimonials" });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<any> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    const assets: Uploaded[] = [];
    if (testimonial.imagePublicId) {
      assets.push({
        public_id: testimonial.imagePublicId,
        secure_url: testimonial.image ?? "",
        resource_type: "image",
      });
    }
    if (testimonial.videoPublicId) {
      assets.push({
        public_id: testimonial.videoPublicId,
        secure_url: testimonial.videoUrl ?? "",
        resource_type: "video",
      });
    }

    await testimonial.deleteOne();
    await destroyQuietly(assets);

    res.status(200).json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
