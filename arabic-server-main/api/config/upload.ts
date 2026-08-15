import multer from "multer";
import type { Request } from "express";

// Uploads were accepted with no size or type limit at all: multer buffers the
// whole file in memory, so a single large POST could exhaust the process, and
// anything at all could be forwarded to Cloudinary.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Testimonial videos need their own ceiling — a one-minute phone clip does not
 * fit in 5 MB. Multer applies `limits.fileSize` to every file in the request,
 * so the testimonial uploader below is configured at the video ceiling and the
 * controller re-checks the image field against MAX_IMAGE_SIZE. Cloudinary's
 * free tier caps a single video at 100 MB, so this stays comfortably under it.
 */
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_SIZE = MAX_FILE_SIZE;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov — what an iPhone produces
  "video/x-m4v",
];
const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilterFor = (allowed: string[]) => (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error(`Unsupported file type: ${file.mimetype}`));
};

/** Blog cover images — images only. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: fileFilterFor(IMAGE_TYPES),
});

/**
 * Content screens that attach more than one image to a record — a teacher's
 * headshot plus an optional full-length portrait, or a landing-page section
 * with several images. Same 5 MB per-file ceiling as `imageUpload`.
 */
export const multiImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 6 },
  fileFilter: fileFilterFor(IMAGE_TYPES),
});

/**
 * Testimonials — an author photo and, optionally, a video file. Accepts images
 * and videos; per-field type checking happens in the controller, which knows
 * which fieldname is which.
 */
export const testimonialUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE, files: 3 },
  fileFilter: fileFilterFor([...IMAGE_TYPES, ...VIDEO_TYPES]),
});

/** Teacher applications — a photo plus up to four supporting documents. */
export const teacherDocsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  fileFilter: fileFilterFor([...IMAGE_TYPES, ...DOCUMENT_TYPES]),
});

/** Job applications — a single PDF or Word document resume. */
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: fileFilterFor(DOCUMENT_TYPES),
});

/**
 * Multer reports limit breaches and rejected types by passing an error to
 * next(), which would otherwise surface as a generic 500.
 */
export const handleUploadErrors = (
  err: any,
  _req: Request,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large (maximum 5 MB for images, 50 MB for videos)"
        : err.code === "LIMIT_FILE_COUNT"
        ? "Too many files uploaded"
        : `Upload error: ${err.message}`;
    return res.status(400).json({ success: false, message });
  }
  if (err && typeof err.message === "string" && err.message.startsWith("Unsupported file type")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  return next(err);
};
