import { Prisma, prisma } from "@marketplace/database";
import { HttpError } from "../lib/http-errors.js";

export type RoleDTO = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

function mapRole(row: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}): RoleDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  };
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

export type ListRolesParams = {
  page: number;
  pageSize: number;
  q?: string | undefined;
};

export async function listRoles(params: ListRolesParams) {
  const where: Prisma.RoleWhereInput = {};
  const term = params.q?.trim();
  if (term) {
    where.name = { contains: term, mode: "insensitive" };
  }

  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.role.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.role.count({ where }),
  ]);

  const totalPages =
    params.pageSize === 0 ? 0 : Math.ceil(total / params.pageSize);

  return {
    data: rows.map((row) => mapRole(row)),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
    },
  };
}

export async function getRoleById(id: string): Promise<RoleDTO> {
  const row = await prisma.role.findUnique({ where: { id } });
  if (!row) {
    throw new HttpError(404, "Role not found", "role_not_found");
  }
  return mapRole(row);
}

export async function createRole(input: {
  name: string;
  description?: string | undefined;
}): Promise<RoleDTO> {
  try {
    const row = await prisma.role.create({
      data: {
        name: input.name,
        description: input.description ?? null,
      },
    });
    return mapRole(row);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      throw new HttpError(
        409,
        "A role with this name already exists",
        "role_name_conflict",
      );
    }
    throw e;
  }
}

export type UpdateRoleInput = {
  id: string;
  name?: string | undefined;
  description?: string | null | undefined;
};

export async function updateRole(input: UpdateRoleInput): Promise<RoleDTO> {
  const existing = await prisma.role.findUnique({
    where: { id: input.id },
    select: { id: true },
  });
  if (!existing) {
    throw new HttpError(404, "Role not found", "role_not_found");
  }

  const data: Prisma.RoleUpdateInput = {};
  if (input.name !== undefined) {
    data.name = input.name;
  }
  if (input.description !== undefined) {
    data.description = input.description;
  }

  try {
    const row = await prisma.role.update({
      where: { id: input.id },
      data,
    });
    return mapRole(row);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      throw new HttpError(
        409,
        "A role with this name already exists",
        "role_name_conflict",
      );
    }
    throw e;
  }
}

export async function deleteRole(id: string): Promise<void> {
  const existing = await prisma.role.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    throw new HttpError(404, "Role not found", "role_not_found");
  }

  await prisma.role.delete({ where: { id } });
}
