import { Prisma, prisma } from "@marketplace/database";
import { HttpError } from "../lib/http-errors.js";

export type UserRoleDTO = {
  userId: string;
  roleId: string;
  createdAt: string;
  role: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
  };
};

function mapRoleSummary(role: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt.toISOString(),
  };
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

async function ensureUserExists(userId: string): Promise<void> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!u) {
    throw new HttpError(404, "User not found", "user_not_found");
  }
}

async function ensureRoleExists(roleId: string): Promise<void> {
  const r = await prisma.role.findUnique({
    where: { id: roleId },
    select: { id: true },
  });
  if (!r) {
    throw new HttpError(404, "Role not found", "role_not_found");
  }
}

export async function listUserRoles(userId: string): Promise<UserRoleDTO[]> {
  await ensureUserExists(userId);

  const rows = await prisma.userRole.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    userId: row.userId,
    roleId: row.roleId,
    createdAt: row.createdAt.toISOString(),
    role: mapRoleSummary(row.role),
  }));
}

export async function assignUserRole(
  userId: string,
  roleId: string,
): Promise<UserRoleDTO> {
  await ensureUserExists(userId);
  await ensureRoleExists(roleId);

  try {
    const row = await prisma.userRole.create({
      data: { userId, roleId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });
    return {
      userId: row.userId,
      roleId: row.roleId,
      createdAt: row.createdAt.toISOString(),
      role: mapRoleSummary(row.role),
    };
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      throw new HttpError(
        409,
        "This role is already assigned to the user",
        "user_role_exists",
      );
    }
    throw e;
  }
}

export async function removeUserRole(
  userId: string,
  roleId: string,
): Promise<void> {
  await ensureUserExists(userId);

  const result = await prisma.userRole.deleteMany({
    where: { userId, roleId },
  });
  if (result.count === 0) {
    throw new HttpError(
      404,
      "Role assignment not found for this user",
      "user_role_not_found",
    );
  }
}
