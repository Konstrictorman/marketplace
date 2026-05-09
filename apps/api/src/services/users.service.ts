import { Prisma, prisma } from "@marketplace/database";
import { hashPassword } from "../lib/password-hash.js";
import { HttpError } from "../lib/http-errors.js";

export type UserPublicDTO = {
  id: string;
  institutionalEmail: string;
  name: string;
  career: string | null;
  photoUrl: string | null;
  reputation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type UserRow = {
  id: string;
  institutionalEmail: string;
  name: string;
  career: string | null;
  photoUrl: string | null;
  reputation: Prisma.Decimal;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function mapUser(row: UserRow): UserPublicDTO {
  return {
    id: row.id,
    institutionalEmail: row.institutionalEmail,
    name: row.name,
    career: row.career,
    photoUrl: row.photoUrl,
    reputation: row.reputation.toString(),
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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

export type ListUsersParams = {
  page: number;
  pageSize: number;
  q?: string | undefined;
  isActive?: boolean | undefined;
  sortBy: "createdAt" | "name" | "institutionalEmail";
  sortOrder: "asc" | "desc";
};

export async function listUsers(params: ListUsersParams) {
  const where: Prisma.UserWhereInput = {};
  if (params.isActive !== undefined) {
    where.isActive = params.isActive;
  }
  const term = params.q?.trim();
  if (term) {
    where.OR = [
      { institutionalEmail: { contains: term, mode: "insensitive" } },
      { name: { contains: term, mode: "insensitive" } },
    ];
  }

  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;
  const orderBy = {
    [params.sortBy]: params.sortOrder,
  } as Prisma.UserOrderByWithRelationInput;

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        institutionalEmail: true,
        name: true,
        career: true,
        photoUrl: true,
        reputation: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages =
    params.pageSize === 0 ? 0 : Math.ceil(total / params.pageSize);

  return {
    data: rows.map((row) => mapUser(row)),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
    },
  };
}

export async function getUserById(id: string): Promise<UserPublicDTO> {
  const row = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      institutionalEmail: true,
      name: true,
      career: true,
      photoUrl: true,
      reputation: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!row) {
    throw new HttpError(404, "User not found", "user_not_found");
  }
  return mapUser(row);
}

export async function createUser(input: {
  institutionalEmail: string;
  password: string;
  name: string;
  career?: string | null | undefined;
  photoUrl?: string | null | undefined;
}): Promise<UserPublicDTO> {
  const passwordHash = await hashPassword(input.password);
  try {
    const row = await prisma.user.create({
      data: {
        institutionalEmail: input.institutionalEmail,
        passwordHash,
        name: input.name,
        career: input.career ?? null,
        photoUrl: input.photoUrl ?? null,
      },
      select: {
        id: true,
        institutionalEmail: true,
        name: true,
        career: true,
        photoUrl: true,
        reputation: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return mapUser(row);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      throw new HttpError(
        409,
        "An account with this email already exists",
        "user_email_conflict",
      );
    }
    throw e;
  }
}

export type UpdateUserInput = {
  id: string;
  institutionalEmail?: string | undefined;
  password?: string | undefined;
  name?: string | undefined;
  career?: string | null | undefined;
  photoUrl?: string | null | undefined;
  reputation?: string | undefined;
  isActive?: boolean | undefined;
};

export async function updateUser(
  input: UpdateUserInput,
): Promise<UserPublicDTO> {
  const existing = await prisma.user.findUnique({
    where: { id: input.id },
    select: { id: true },
  });
  if (!existing) {
    throw new HttpError(404, "User not found", "user_not_found");
  }

  const data: Prisma.UserUpdateInput = {};
  if (input.institutionalEmail !== undefined) {
    data.institutionalEmail = input.institutionalEmail;
  }
  if (input.name !== undefined) {
    data.name = input.name;
  }
  if (input.career !== undefined) {
    data.career = input.career;
  }
  if (input.photoUrl !== undefined) {
    data.photoUrl = input.photoUrl;
  }
  if (input.reputation !== undefined) {
    data.reputation = input.reputation;
  }
  if (input.isActive !== undefined) {
    data.isActive = input.isActive;
  }
  if (input.password !== undefined) {
    data.passwordHash = await hashPassword(input.password);
  }

  try {
    const row = await prisma.user.update({
      where: { id: input.id },
      data,
      select: {
        id: true,
        institutionalEmail: true,
        name: true,
        career: true,
        photoUrl: true,
        reputation: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return mapUser(row);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      throw new HttpError(
        409,
        "An account with this email already exists",
        "user_email_conflict",
      );
    }
    throw e;
  }
}

export async function deleteUser(id: string): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    throw new HttpError(404, "User not found", "user_not_found");
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyConstraintError(e)) {
      throw new HttpError(
        409,
        "User cannot be deleted while referenced by orders, products, or other records",
        "user_in_use",
      );
    }
    throw e;
  }
}
