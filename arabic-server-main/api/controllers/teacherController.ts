import { Request, Response } from "express";
import Teacher, { ITeacher } from "../models/teacher";
import { containsRegex } from "../utils/escapeRegex";
import { uploadBuffer, destroyQuietly, UploadedAsset } from "../utils/cloudinaryUpload";
import { MAX_IMAGE_SIZE } from "../config/upload";

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

const IMAGE_MIME = /^image\//;

/**
 * Shared field handling for create and update. Returns either the fields to
 * write or a message to send back with a 400.
 */
const buildFields = async (
  req: Request,
  uploaded: UploadedAsset[],
  existing?: ITeacher
): Promise<{ error: string } | { fields: Partial<ITeacher> }> => {
  const files = req.files as MulterFiles;
  const body = req.body as Record<string, unknown>;

  const asString = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string).trim() : undefined;

  const fields: Partial<ITeacher> = {};

  const name = asString("name") ?? existing?.name;
  if (!name) return { error: "Teacher name is required" };
  fields.name = name;

  fields.profession = asString("profession") ?? existing?.profession ?? "Arabic Teacher";
  fields.grade = asString("grade") ?? existing?.grade ?? "1-10";
  fields.experience = asString("experience") ?? existing?.experience ?? "";
  fields.education = asString("education") ?? existing?.education ?? "";
  fields.subject = asString("subject") ?? existing?.subject ?? "Arabic";
  fields.shortDescription =
    asString("shortDescription") ?? existing?.shortDescription ?? "";

  const rating = Number(asString("rating") ?? existing?.rating ?? 5);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5" };
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

  // A checkbox posts "true"/"false" as a string; absent means "leave as is".
  const showOnHomepage = asString("showOnHomepage");
  fields.showOnHomepage =
    showOnHomepage === undefined
      ? existing?.showOnHomepage ?? true
      : showOnHomepage === "true";

  for (const [field, urlKey, idKey] of [
    ["photo", "image", "imagePublicId"],
    ["portrait", "portrait", "portraitPublicId"],
  ] as const) {
    const file = files?.[field]?.[0];
    if (!file) continue;

    if (!IMAGE_MIME.test(file.mimetype)) {
      return { error: `The ${field} field must be an image` };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { error: `${field === "photo" ? "Photo" : "Portrait"} is too large (maximum 5 MB)` };
    }

    const result = await uploadBuffer(file, "teachers");
    uploaded.push(result);
    (fields as Record<string, unknown>)[urlKey] = result.secure_url;
    (fields as Record<string, unknown>)[idKey] = result.public_id;
  }

  // The schema marks image required and every card dereferences it.
  if (!fields.image && !existing?.image) {
    return { error: "A photo is required" };
  }

  return { fields };
};

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/**
 * Powers the teachers page, the homepage slider and the About Us carousel.
 * `?homepage=true` narrows it to the highlight reel.
 */
export const getPublishedTeachers = async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = { status: "published" };
    if (req.query.homepage === "true") filter.showOnHomepage = true;

    const teachers = await Teacher.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, message: "success", data: teachers });
  } catch (error: any) {
    console.error("Error listing published teachers:", error);
    res.status(500).json({ success: false, message: "Could not load teachers" });
  }
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    let filter: Record<string, unknown> = {};
    if (typeof search === "string" && search.trim() !== "") {
      const regex = containsRegex(search);
      filter = {
        $or: [{ name: regex }, { profession: regex }, { subject: regex }],
      };
    }

    const total = await Teacher.countDocuments(filter);
    const teachers = await Teacher.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      message: "success",
      data: teachers,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error listing teachers:", error);
    res.status(500).json({ success: false, message: "Could not load teachers" });
  }
};

export const getTeacherById = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch {
    res.status(400).json({ success: false, message: "Invalid teacher id" });
  }
};

export const createTeacher = async (req: Request, res: Response): Promise<any> => {
  const uploaded: UploadedAsset[] = [];
  try {
    const result = await buildFields(req, uploaded);
    if ("error" in result) {
      await destroyQuietly(uploaded);
      return res.status(400).json({ success: false, message: result.error });
    }

    const teacher = await Teacher.create(result.fields);
    res.status(201).json({ success: true, data: teacher });
  } catch (error: any) {
    await destroyQuietly(uploaded);
    console.error("Error creating teacher:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTeacher = async (req: Request, res: Response): Promise<any> => {
  const uploaded: UploadedAsset[] = [];
  try {
    const existing = await Teacher.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const result = await buildFields(req, uploaded, existing);
    if ("error" in result) {
      await destroyQuietly(uploaded);
      return res.status(400).json({ success: false, message: result.error });
    }

    // Collected before the save so a replaced asset is only dropped once the
    // new one is safely persisted.
    const replaced: UploadedAsset[] = [];
    if (existing.imagePublicId && result.fields.imagePublicId !== existing.imagePublicId) {
      replaced.push({
        public_id: existing.imagePublicId,
        secure_url: existing.image,
        resource_type: "image",
      });
    }
    if (
      existing.portraitPublicId &&
      result.fields.portraitPublicId !== existing.portraitPublicId
    ) {
      replaced.push({
        public_id: existing.portraitPublicId,
        secure_url: existing.portrait ?? "",
        resource_type: "image",
      });
    }

    existing.set(result.fields);
    await existing.save();

    await destroyQuietly(replaced);
    res.status(200).json({ success: true, data: existing });
  } catch (error: any) {
    await destroyQuietly(uploaded);
    console.error("Error updating teacher:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTeacher = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const assets: UploadedAsset[] = [];
    if (teacher.imagePublicId) {
      assets.push({
        public_id: teacher.imagePublicId,
        secure_url: teacher.image,
        resource_type: "image",
      });
    }
    if (teacher.portraitPublicId) {
      assets.push({
        public_id: teacher.portraitPublicId,
        secure_url: teacher.portrait ?? "",
        resource_type: "image",
      });
    }

    await teacher.deleteOne();
    await destroyQuietly(assets);

    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
