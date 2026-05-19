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

type SellerSummary = {
  name: string;
};

function mapSellerSummary(seller: SellerSummary) {
  return {
    sellerUserName: seller.name,
  };
}

function mapProduct(
  product: ProductRow,
  mainImageUrl: string | null = null,
  seller?: SellerSummary,
) {
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
    ...(seller ? mapSellerSummary(seller) : {}),
  };
}

type ProductListRow = {
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
  images: { url: string }[];
  seller: SellerSummary;
};

function mapProductListItem(row: ProductListRow) {
  const mainImageUrl = row.images[0]?.url ?? null;
  return {
    id: row.id,
    sellerId: row.sellerId,
    categoryId: row.categoryId,
    title: row.title,
    description: row.description,
    price: row.price.toString(),
    condition: row.condition,
    inventory: row.inventory,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    mainImageUrl,
    ...mapSellerSummary(row.seller),
  };
}

const productImageSelect = {
  orderBy: [
    { isMain: Prisma.SortOrder.desc },
    { sortOrder: Prisma.SortOrder.asc },
    { createdAt: Prisma.SortOrder.asc },
  ],
  take: 1,
  select: { url: true },
};

const productCoreSelect = {
  id: true,
  sellerId: true,
  categoryId: true,
  title: true,
  description: true,
  price: true,
  condition: true,
  inventory: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const productListSelect = {
  ...productCoreSelect,
  images: productImageSelect,
  seller: { select: { name: true } },
};

const productDetailSelect = {
  ...productCoreSelect,
  seller: { select: { name: true } },
  images: productImageSelect,
};

type ProductRatingAggregateRow = {
  avg_rating: string | null;
  rating_count: bigint | number | null;
};

/** Average of non-null `order_items.rating` for the product (0 when none). */
export async function getProductRating(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }

  const [row] = await prisma.$queryRaw<ProductRatingAggregateRow[]>`
    SELECT
      AVG(rating)::text AS avg_rating,
      COUNT(rating)::bigint AS rating_count
    FROM order_items
    WHERE product_id = ${productId}::uuid
      AND rating IS NOT NULL
  `;

  const ratingCount = row?.rating_count != null ? Number(row.rating_count) : 0;
  const avgRating =
    row?.avg_rating != null ? Number(row.avg_rating) : Number.NaN;

  return {
    productId,
    rating:
      Number.isFinite(avgRating) && ratingCount > 0
        ? avgRating.toFixed(2)
        : "0.00",
    ratingCount,
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

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      select: productListSelect,
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

  const [product, sellerProfile] = await prisma.$transaction([
    prisma.product.create({
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
      select: productCoreSelect,
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: input.sellerId },
      select: { name: true },
    }),
  ]);

  return mapProduct(product, null, sellerProfile);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: productDetailSelect,
  });
  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }
  const { images, seller, ...rest } = product;
  return mapProduct(rest, images[0]?.url ?? null, seller);
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
    select: productDetailSelect,
  });

  const { images, seller, ...rest } = product;
  return mapProduct(rest, images[0]?.url ?? null, seller);
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
