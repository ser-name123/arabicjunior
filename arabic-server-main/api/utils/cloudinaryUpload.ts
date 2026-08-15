import cloudinary from "../config/cloudinary";

export interface UploadedAsset {
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video";
}

/**
 * Streams the buffer straight to Cloudinary.
 *
 * The blog controller base64-encodes into a data URI first, which is fine for a
 * cover image but not for a 50 MB video: base64 inflates it by a third and the
 * whole string sits in memory alongside the buffer.
 */
export const uploadBuffer = (
  file: Express.Multer.File,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<UploadedAsset> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: resourceType,
        });
      }
    );
    stream.end(file.buffer);
  });

/**
 * Removes assets without letting a cleanup failure mask the original error.
 * Used both to roll back a half-finished create and to drop assets a save has
 * just replaced.
 */
export const destroyQuietly = async (assets: UploadedAsset[]) => {
  for (const asset of assets) {
    try {
      await cloudinary.uploader.destroy(asset.public_id, {
        resource_type: asset.resource_type,
      });
    } catch (err) {
      console.error(`Could not remove Cloudinary asset ${asset.public_id}:`, err);
    }
  }
};

/** Poster frame generated from an uploaded video. */
export const videoPosterUrl = (publicId: string) =>
  cloudinary.url(`${publicId}.jpg`, {
    resource_type: "video",
    transformation: [{ width: 640, height: 360, crop: "fill", start_offset: "0" }],
  });
