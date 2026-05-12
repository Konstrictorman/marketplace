import type { ApiError } from "@/lib/api/client";
import { apiClient } from "@/lib/api/client";

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductCondition = "new" | "used" | "refurbished";
export type ProductStatus = "active" | "inactive" | "removed";

export type ProductListItem = {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  price: string;
  condition: ProductCondition;
  inventory: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  /** Resolved gallery image: `isMain` first, else lowest `sortOrder`. */
  mainImageUrl: string | null;
};

export type Product = ProductListItem & {
  description: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
  isMain: boolean;
  createdAt: string;
};

export type ListProductsQuery = {
  page?: number;
  pageSize?: number;
  status?: ProductStatus;
  categoryId?: string;
  sellerId?: string;
  condition?: ProductCondition;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sortBy?: "createdAt" | "price" | "title";
  sortOrder?: "asc" | "desc";
};

export type CreateProductBody = {
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  condition: ProductCondition;
  inventory: number;
  status?: ProductStatus;
};

export type UpdateProductBody = {
  sellerId: string;
  categoryId?: string;
  title?: string;
  description?: string;
  price?: string;
  condition?: ProductCondition;
  inventory?: number;
  status?: ProductStatus;
};

export type DeleteProductBody = {
  sellerId: string;
};

export type CreateProductImageBody = {
  sellerId: string;
  url: string;
  sortOrder?: number;
  isMain?: boolean;
};

export type UpdateProductImageBody = {
  sellerId: string;
  url?: string;
  sortOrder?: number;
  isMain?: boolean;
};

export type DeleteProductImageBody = {
  sellerId: string;
};

export async function listProducts(query: ListProductsQuery = {}) {
  const { data } = await apiClient.get<{
    data: ProductListItem[];
    meta: PaginationMeta;
  }>("/api/products", { params: query });
  return data;
}

export async function createProduct(body: CreateProductBody) {
  const { data } = await apiClient.post<{ data: Product }>(
    "/api/products",
    body,
  );
  return data;
}

/**
 * `POST /api/uploads` (multipart). Uses `fetch` so `Content-Type` is not forced to JSON
 * (see default headers on {@link apiClient}).
 */
export async function uploadProductImage(
  sellerId: string,
  file: File,
): Promise<{ url: string }> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");
  const formData = new FormData();
  formData.append("sellerId", sellerId);
  formData.append("file", file);

  const res = await fetch(`${baseUrl}/api/uploads`, {
    method: "POST",
    body: formData,
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    let message = res.statusText || "Error al subir la imagen";
    if (
      json &&
      typeof json === "object" &&
      "error" in json &&
      json.error !== null &&
      typeof (json as { error: unknown }).error === "object"
    ) {
      const em = (json as { error: { message?: string } }).error.message;
      if (typeof em === "string") message = em;
    }
    const err = { status: res.status, message } satisfies ApiError;
    throw err;
  }

  if (
    !json ||
    typeof json !== "object" ||
    !("data" in json) ||
    typeof (json as { data: unknown }).data !== "object" ||
    (json as { data: { url?: unknown } }).data === null
  ) {
    throw {
      status: 500,
      message: "Respuesta de subida inválida",
    } satisfies ApiError;
  }
  const url = (json as { data: { url?: unknown } }).data.url;
  if (typeof url !== "string") {
    throw {
      status: 500,
      message: "Respuesta de subida inválida",
    } satisfies ApiError;
  }
  return { url };
}

export async function getProductById(id: string) {
  const { data } = await apiClient.get<{ data: Product }>(
    `/api/products/${id}`,
  );
  return data;
}

export async function updateProduct(id: string, body: UpdateProductBody) {
  const { data } = await apiClient.patch<{ data: Product }>(
    `/api/products/${id}`,
    body,
  );
  return data;
}

export async function deleteProduct(id: string, body: DeleteProductBody) {
  await apiClient.delete(`/api/products/${id}`, { data: body });
}

export async function listProductImages(productId: string) {
  const { data } = await apiClient.get<{ data: ProductImage[] }>(
    `/api/products/${productId}/images`,
  );
  return data;
}

export async function createProductImage(
  productId: string,
  body: CreateProductImageBody,
) {
  const { data } = await apiClient.post<{ data: ProductImage }>(
    `/api/products/${productId}/images`,
    body,
  );
  return data;
}

export async function getProductImage(productId: string, imageId: string) {
  const { data } = await apiClient.get<{ data: ProductImage }>(
    `/api/products/${productId}/images/${imageId}`,
  );
  return data;
}

export async function updateProductImage(
  productId: string,
  imageId: string,
  body: UpdateProductImageBody,
) {
  const { data } = await apiClient.patch<{ data: ProductImage }>(
    `/api/products/${productId}/images/${imageId}`,
    body,
  );
  return data;
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  body: DeleteProductImageBody,
) {
  await apiClient.delete(`/api/products/${productId}/images/${imageId}`, {
    data: body,
  });
}
