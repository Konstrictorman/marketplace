import { ProductStatus, prisma } from "@marketplace/database";
import { HttpError } from "../lib/http-errors.js";

function mapProductImage(row: {
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
  isMain: boolean;
  createdAt: Date;
}) {
  return {
    id: row.id,
    productId: row.productId,
    url: row.url,
    sortOrder: row.sortOrder,
    isMain: row.isMain,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listProductImages(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }

  const rows = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  return rows.map(mapProductImage);
}

export async function getProductImage(productId: string, imageId: string) {
  const row = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });

  if (row) {
    return mapProductImage(row);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }

  throw new HttpError(404, "Image not found", "image_not_found");
}

export type CreateProductImageInput = {
  productId: string;
  sellerId: string;
  url: string;
  sortOrder?: number | undefined;
  isMain?: boolean | undefined;
};

export async function createProductImage(input: CreateProductImageInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true, sellerId: true, status: true },
  });

  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }

  if (product.sellerId !== input.sellerId) {
    throw new HttpError(
      403,
      "You can only add images to your own products",
      "forbidden",
    );
  }

  if (product.status === ProductStatus.removed) {
    throw new HttpError(
      409,
      "Cannot add images to a removed product",
      "product_removed",
    );
  }

  const sortOrder = input.sortOrder ?? 0;
  const isMain = input.isMain ?? false;

  const row = await prisma.$transaction(async (tx) => {
    if (isMain) {
      await tx.productImage.updateMany({
        where: { productId: input.productId },
        data: { isMain: false },
      });
    }
    return tx.productImage.create({
      data: {
        productId: input.productId,
        url: input.url,
        sortOrder,
        isMain,
      },
    });
  });

  return mapProductImage(row);
}

export type UpdateProductImageInput = {
  productId: string;
  imageId: string;
  sellerId: string;
  url?: string | undefined;
  sortOrder?: number | undefined;
  isMain?: boolean | undefined;
};

export async function updateProductImage(input: UpdateProductImageInput) {
  const row = await prisma.productImage.findFirst({
    where: { id: input.imageId, productId: input.productId },
    include: {
      product: { select: { sellerId: true, status: true } },
    },
  });

  if (!row) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      select: { id: true },
    });
    if (!product) {
      throw new HttpError(404, "Product not found", "product_not_found");
    }
    throw new HttpError(404, "Image not found", "image_not_found");
  }

  if (row.product.sellerId !== input.sellerId) {
    throw new HttpError(
      403,
      "You can only update images on your own products",
      "forbidden",
    );
  }

  if (row.product.status === ProductStatus.removed) {
    throw new HttpError(
      409,
      "Cannot update images on a removed product",
      "product_removed",
    );
  }

  const data: { url?: string; sortOrder?: number; isMain?: boolean } = {};
  if (input.url !== undefined) data.url = input.url;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.isMain !== undefined) data.isMain = input.isMain;

  const updated =
    input.isMain === true
      ? await prisma.$transaction(async (tx) => {
          await tx.productImage.updateMany({
            where: {
              productId: input.productId,
              id: { not: input.imageId },
            },
            data: { isMain: false },
          });
          return tx.productImage.update({
            where: { id: input.imageId },
            data,
          });
        })
      : await prisma.productImage.update({
          where: { id: input.imageId },
          data,
        });

  return mapProductImage(updated);
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  sellerId: string,
) {
  const row = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
    include: {
      product: { select: { sellerId: true, status: true } },
    },
  });

  if (!row) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new HttpError(404, "Product not found", "product_not_found");
    }
    throw new HttpError(404, "Image not found", "image_not_found");
  }

  if (row.product.sellerId !== sellerId) {
    throw new HttpError(
      403,
      "You can only delete images from your own products",
      "forbidden",
    );
  }

  if (row.product.status === ProductStatus.removed) {
    throw new HttpError(
      409,
      "Cannot delete images from a removed product",
      "product_removed",
    );
  }

  await prisma.productImage.delete({
    where: { id: imageId },
  });
}
