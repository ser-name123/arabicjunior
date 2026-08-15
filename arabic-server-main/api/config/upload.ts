import multer from "multer";
import type { Request } from "express";

// Uploads were accepted with no size or type limit at all: multer buffers the
// whole file in memory, so a single large POST could exhaust the process, and
// anything at all could be forwarded to Cloudinary.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
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

/** Teacher applications — a photo plus up to four supporting documents. */
export const teacherDocsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  fileFilter: fileFilterFor([...IMAGE_TYPES, ...DOCUMENT_TYPES]),
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
        ? "File is too large (maximum 5 MB)"
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
