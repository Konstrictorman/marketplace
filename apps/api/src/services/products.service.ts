import {
  Prisma,
  ProductCondition,
  ProductStatus,
  prisma,
} from "@marketplace/database";
import { HttpError } from "../lib/http-errors.js";

type CreateProductInput = {
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  condition: ProductCondition;
  inventory: number;
  status: ProductStatus;
};

type ProductRow = {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: Prisma.Decimal;
  condition: ProductCondition;
  inventory: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
};

function mapProduct(product: ProductRow, mainImageUrl: string | null = null) {
  return {
    id: product.id,
    sellerId: product.sellerId,
    categoryId: product.categoryId,
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    condition: product.condition,
    inventory: product.inventory,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    mainImageUrl,
  };
}

type ProductListRow = {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  price: Prisma.Decimal;
  condition: ProductCondition;
  inventory: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  images: { url: string }[];
};

/** List payloads omit heavy `description` (use GET by id when needed). */
function mapProductListItem(row: ProductListRow) {
  const mainImageUrl = row.images[0]?.url ?? null;
  return {
    id: row.id,
    sellerId: row.sellerId,
    categoryId: row.categoryId,
    title: row.title,
    price: row.price.toString(),
    condition: row.condition,
    inventory: row.inventory,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    mainImageUrl,
  };
}

export type ListProductsParams = {
  page: number;
  pageSize: number;
  status?: ProductStatus | undefined;
  categoryId?: string | undefined;
  sellerId?: string | undefined;
  condition?: ProductCondition | undefined;
  minPrice?: string | undefined;
  maxPrice?: string | undefined;
  q?: string | undefined;
  sortBy: "createdAt" | "price" | "title";
  sortOrder: "asc" | "desc";
};

export async function listProducts(params: ListProductsParams) {
  const clauses: Prisma.ProductWhereInput[] = [];

  if (params.status !== undefined) clauses.push({ status: params.status });
  if (params.categoryId !== undefined)
    clauses.push({ categoryId: params.categoryId });
  if (params.sellerId !== undefined)
    clauses.push({ sellerId: params.sellerId });
  if (params.condition !== undefined)
    clauses.push({ condition: params.condition });

  const priceFilter: Prisma.DecimalFilter = {};
  if (params.minPrice !== undefined) {
    priceFilter.gte = new Prisma.Decimal(params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    priceFilter.lte = new Prisma.Decimal(params.maxPrice);
  }
  if (Object.keys(priceFilter).length > 0) {
    clauses.push({ price: priceFilter });
  }

  const term = params.q?.trim();
  if (term) {
    clauses.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.ProductWhereInput =
    clauses.length === 0
      ? {}
      : clauses.length === 1
        ? clauses[0]!
        : { AND: clauses };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sortBy === "price"
      ? { price: params.sortOrder }
      : params.sortBy === "title"
        ? { title: params.sortOrder }
        : { createdAt: params.sortOrder };

  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  const selectList = {
    id: true,
    sellerId: true,
    categoryId: true,
    title: true,
    price: true,
    condition: true,
    inventory: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    images: {
      orderBy: [
        { isMain: Prisma.SortOrder.desc },
        { sortOrder: Prisma.SortOrder.asc },
        { createdAt: Prisma.SortOrder.asc },
      ],
      take: 1,
      select: { url: true },
    },
  };

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      select: selectList,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages =
    params.pageSize === 0 ? 0 : Math.ceil(total / params.pageSize);

  return {
    data: rows.map((row) => mapProductListItem(row)),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
    },
  };
}

export async function createProduct(input: CreateProductInput) {
  const [seller, category] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.sellerId },
      select: { id: true },
    }),
    prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    }),
  ]);

  if (!seller) {
    throw new HttpError(404, "Seller not found", "seller_not_found");
  }

  if (!category) {
    throw new HttpError(404, "Category not found", "category_not_found");
  }

  const product = await prisma.product.create({
    data: {
      sellerId: input.sellerId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      price: new Prisma.Decimal(input.price),
      condition: input.condition,
      inventory: input.inventory,
      status: input.status,
    },
  });

  return mapProduct(product, null);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: [
          { isMain: Prisma.SortOrder.desc },
          { sortOrder: Prisma.SortOrder.asc },
          { createdAt: Prisma.SortOrder.asc },
        ],
        take: 1,
        select: { url: true },
      },
    },
  });
  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }
  const { images, ...rest } = product;
  return mapProduct(rest, images[0]?.url ?? null);
}

export type UpdateProductInput = {
  id: string;
  sellerId: string;
  categoryId?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  price?: string | undefined;
  condition?: ProductCondition | undefined;
  inventory?: number | undefined;
  status?: ProductStatus | undefined;
};

export async function updateProduct(input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({
    where: { id: input.id },
    select: { id: true, sellerId: true },
  });

  if (!existing) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }

  if (existing.sellerId !== input.sellerId) {
    throw new HttpError(
      403,
      "You can only update your own products",
      "forbidden",
    );
  }

  if (input.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new HttpError(404, "Category not found", "category_not_found");
    }
  }

  const data: Prisma.ProductUpdateInput = {};
  if (input.categoryId !== undefined) {
    data.category = { connect: { id: input.categoryId } };
  }
  if (input.title !== undefined) {
    data.title = input.title;
  }
  if (input.description !== undefined) {
    data.description = input.description;
  }
  if (input.price !== undefined) {
    data.price = new Prisma.Decimal(input.price);
  }
  if (input.condition !== undefined) {
    data.condition = input.condition;
  }
  if (input.inventory !== undefined) {
    data.inventory = input.inventory;
  }
  if (input.status !== undefined) {
    data.status = input.status;
  }

  const product = await prisma.product.update({
    where: { id: input.id },
    data,
    include: {
      images: {
        orderBy: [
          { isMain: Prisma.SortOrder.desc },
          { sortOrder: Prisma.SortOrder.asc },
          { createdAt: Prisma.SortOrder.asc },
        ],
        take: 1,
        select: { url: true },
      },
    },
  });

  const { images, ...rest } = product;
  return mapProduct(rest, images[0]?.url ?? null);
}

/** Soft delete: set `status` to `removed`. Idempotent when already removed. */
export async function deactivateProduct(id: string, sellerId: string) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, sellerId: true },
  });

  if (!existing) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }

  if (existing.sellerId !== sellerId) {
    throw new HttpError(
      403,
      "You can only delete your own products",
      "forbidden",
    );
  }

  /** Literal avoids stale generated `ProductStatus` objects missing `removed` (skipped field ⇒ no DB change). */
  const statusRemoved = "removed" as ProductStatus;

  await prisma.product.update({
    where: { id },
    data: { status: statusRemoved },
  });
}
