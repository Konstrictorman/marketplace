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
