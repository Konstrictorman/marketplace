import { randomUUID } from "node:crypto";
import multer from "multer";
import { getUploadDir } from "../config/uploads.js";
import { HttpError } from "./http-errors.js";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, getUploadDir());
    },
    filename: (_req, file, cb) => {
      const ext = MIME_TO_EXT[file.mimetype] ?? ".bin";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (MIME_TO_EXT[file.mimetype]) {
      cb(null, true);
      return;
    }
    cb(
      new HttpError(
        415,
        "Only JPEG, PNG, WebP, and GIF images are allowed",
        "unsupported_media_type",
      ),
    );
  },
});

/** Single file field name `file`; form field `sellerId` (UUID) required in the same multipart request. */
export const uploadProductImageFile = upload.single("file");
