import { prisma } from "@marketplace/database";
import { Router } from "express";
import { z } from "zod";
import { getPublicUploadUrlBase } from "../config/uploads.js";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-errors.js";
import { uploadProductImageFile } from "../lib/multer-upload.js";

const router = Router();

const sellerIdFieldSchema = z.object({
  sellerId: z.string().uuid(),
});

router.post(
  "/uploads",
  uploadProductImageFile,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(
        400,
        'Missing file: use multipart field "file"',
        "missing_file",
      );
    }

    const parsed = sellerIdFieldSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        'Invalid body: multipart field "sellerId" (UUID) is required',
        "validation_failed",
        parsed.error.flatten(),
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.sellerId },
      select: { id: true },
    });

    if (!user) {
      throw new HttpError(404, "User not found", "user_not_found");
    }

    const base = getPublicUploadUrlBase();
    const url = `${base}/${req.file.filename}`;

    res.status(201).json({ data: { url } });
  }),
);

export default router;
