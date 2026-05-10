import { apiClient } from "@/lib/api/client";

export type CreateUserRequestBody = {
  institutionalEmail: string;
  password: string;
  name: string;
  career?: string | null;
  photoUrl?: string | null;
};

export type UserPublic = {
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

/**
 * Creates a user on the Express API (`POST /api/users`).
 */
export async function createUser(
  body: CreateUserRequestBody,
): Promise<UserPublic> {
  const { data } = await apiClient.post<{ data: UserPublic }>(
    "/api/users",
    body,
  );
  return data.data;
}
