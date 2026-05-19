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
