import { Router, type Request, type Response } from "express";
import multer from "multer";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const router = Router();

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 8;

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedVideoTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_FILES,
    fileSize: VIDEO_MAX_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedImageTypes.has(file.mimetype) || allowedVideoTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error("Only JPG, PNG, WEBP, MP4, MOV, and WEBM files are allowed"));
  },
});

type UploadedMedia = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
};

function ensureCloudinaryConfig() {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary env vars: ${missing.join(", ")}`);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function uploadToCloudinary(file: Express.Multer.File, folder = "onfocus/partner-applications"): Promise<UploadedMedia> {
  const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";

  return new Promise((resolvePromise, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${folder}/${resourceType}s`,
        resource_type: resourceType,
        unique_filename: true,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolvePromise({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
      },
    );

    stream.end(file.buffer);
  });
}

const singleImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// -----------------------------------------------------------------------------
// POST /api/uploads/image — Direct single image upload to Cloudinary (for events)
// -----------------------------------------------------------------------------
router.post(
  "/image",
  singleImageUpload.any(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      ensureCloudinaryConfig();

      const files = req.files as Express.Multer.File[] | undefined;
      const file = files && files.length > 0 ? files[0] : req.file;

      if (!file) {
        res.status(400).json({ error: "No image file uploaded from device" });
        return;
      }

      if (!file.mimetype.startsWith("image/")) {
        res.status(400).json({ error: "Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed" });
        return;
      }

      const uploaded = await uploadToCloudinary(file, "onfocus/events");

      res.status(200).json({
        success: true,
        url: uploaded.url,
        publicId: uploaded.publicId,
        format: uploaded.format,
        bytes: uploaded.bytes,
        width: uploaded.width,
        height: uploaded.height,
      });
    } catch (err: any) {
      console.error("Cloudinary event image upload error:", err);
      res.status(500).json({
        error: err?.message || "Failed to upload image to Cloudinary",
      });
    }
  }
);

router.post(
  "/media",
  upload.array("files", MAX_FILES),
  async (req: Request, res: Response): Promise<void> => {
    try {
      ensureCloudinaryConfig();

      const files = (req.files ?? []) as Express.Multer.File[];

      if (files.length === 0) {
        res.status(400).json({ error: "No files uploaded" });
        return;
      }

      const imageFiles = files.filter((file) => file.mimetype.startsWith("image/"));
      const videoFiles = files.filter((file) => file.mimetype.startsWith("video/"));

      if (imageFiles.length > 7) {
        res.status(400).json({ error: "Maximum 7 images are allowed" });
        return;
      }

      if (videoFiles.length > 1) {
        res.status(400).json({ error: "Maximum 1 video is allowed" });
        return;
      }

      const oversizedImage = imageFiles.find((file) => file.size > IMAGE_MAX_BYTES);
      if (oversizedImage) {
        res.status(400).json({ error: "Each image must be 5 MB or smaller" });
        return;
      }

      const oversizedVideo = videoFiles.find((file) => file.size > VIDEO_MAX_BYTES);
      if (oversizedVideo) {
        res.status(400).json({ error: "Each video must be 10 MB or smaller" });
        return;
      }

      const media = await Promise.all(files.map((file) => uploadToCloudinary(file)));

      res.status(201).json({ media });
    } catch (err) {
      console.error("Upload error:", err);

      const message =
        err instanceof Error && err.name === "TimeoutError"
          ? "Upload timed out. Please try a smaller file or check your internet connection."
          : "Failed to upload media. Please check the file size and try again.";

      res.status(500).json({ error: message });
    }
  },
);

export default router;