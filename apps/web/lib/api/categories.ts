import { apiClient } from "@/lib/api/client";
import type { PaginationMeta } from "@/lib/api/products";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export type ListCategoriesQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  isActive?: boolean;
};

export type CreateCategoryBody = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type PatchCategoryBody = {
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export async function listCategories(query: ListCategoriesQuery = {}) {
  const { data } = await apiClient.get<{
    data: Category[];
    meta: PaginationMeta;
  }>("/api/categories", { params: query });
  return data;
}

export async function getCategoryById(categoryId: string) {
  const { data } = await apiClient.get<{ data: Category }>(
    `/api/categories/${categoryId}`,
  );
  return data;
}

export async function createCategory(body: CreateCategoryBody) {
  const { data } = await apiClient.post<{ data: Category }>(
    "/api/categories",
    body,
  );
  return data;
}

export async function patchCategory(
  categoryId: string,
  body: PatchCategoryBody,
) {
  const { data } = await apiClient.patch<{ data: Category }>(
    `/api/categories/${categoryId}`,
    body,
  );
  return data;
}

export async function deleteCategory(categoryId: string) {
  await apiClient.delete(`/api/categories/${categoryId}`);
}
