import { Prisma, prisma } from "@marketplace/database";
import { HttpError } from "../lib/http-errors.js";

export type CategoryDTO = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

function mapCategory(row: {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}): CategoryDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

function isForeignKeyConstraintError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003"
  );
}

export type ListCategoriesParams = {
  page: number;
  pageSize: number;
  q?: string | undefined;
  isActive?: boolean | undefined;
};

export async function listCategories(params: ListCategoriesParams) {
  const where: Prisma.CategoryWhereInput = {};
  const term = params.q?.trim();
  if (term) {
    where.name = { contains: term, mode: "insensitive" };
  }
  if (params.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.category.count({ where }),
  ]);

  const totalPages =
    params.pageSize === 0 ? 0 : Math.ceil(total / params.pageSize);

  return {
    data: rows.map((row) => mapCategory(row)),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
    },
  };
}

export async function getCategoryById(id: string): Promise<CategoryDTO> {
  const row = await prisma.category.findUnique({ where: { id } });
  if (!row) {
    throw new HttpError(404, "Category not found", "category_not_found");
  }
  return mapCategory(row);
}

export async function createCategory(input: {
  name: string;
  description?: string | undefined;
  isActive?: boolean | undefined;
}): Promise<CategoryDTO> {
  try {
    const row = await prisma.category.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        isActive: input.isActive ?? true,
      },
    });
    return mapCategory(row);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      throw new HttpError(
        409,
        "A category with this name already exists",
        "category_name_conflict",
      );
    }
    throw e;
  }
}

export type UpdateCategoryInput = {
  id: string;
  name?: string | undefined;
  description?: string | null | undefined;
  isActive?: boolean | undefined;
};

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<CategoryDTO> {
  const existing = await prisma.category.findUnique({
    where: { id: input.id },
    select: { id: true },
  });
  if (!existing) {
    throw new HttpError(404, "Category not found", "category_not_found");
  }

  const data: Prisma.CategoryUpdateInput = {};
  if (input.name !== undefined) {
    data.name = input.name;
  }
  if (input.description !== undefined) {
    data.description = input.description;
  }
  if (input.isActive !== undefined) {
    data.isActive = input.isActive;
  }

  try {
    const row = await prisma.category.update({
      where: { id: input.id },
      data,
    });
    return mapCategory(row);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      throw new HttpError(
        409,
        "A category with this name already exists",
        "category_name_conflict",
      );
    }
    throw e;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    throw new HttpError(404, "Category not found", "category_not_found");
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyConstraintError(e)) {
      throw new HttpError(
        409,
        "Cannot delete category while products reference it",
        "category_in_use",
      );
    }
    throw e;
  }
}
