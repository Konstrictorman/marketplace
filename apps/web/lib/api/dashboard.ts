import { apiClient } from "@/lib/api/client";

export type CategorySalesSlice = {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
};

export async function getSalesByCategory(): Promise<CategorySalesSlice[]> {
  const { data } = await apiClient.get<{ data: CategorySalesSlice[] }>(
    "/api/dashboard/sales-by-category",
  );
  return data.data;
}

export type ProductsPublishedPoint = {
  date: string;
  count: number;
};

export async function getProductsPublishedLastMonth(): Promise<
  ProductsPublishedPoint[]
> {
  const { data } = await apiClient.get<{ data: ProductsPublishedPoint[] }>(
    "/api/dashboard/products-published",
  );
  return data.data;
}

export type BestSeller = {
  productId: string;
  productTitle: string;
  quantitySold: number;
};

export async function getTopBestSellers(): Promise<BestSeller[]> {
  const { data } = await apiClient.get<{ data: BestSeller[] }>(
    "/api/dashboard/top-best-sellers",
  );
  return data.data;
}
