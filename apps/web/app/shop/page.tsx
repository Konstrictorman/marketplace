import { Suspense } from "react";
import { Box, Grid, Typography } from "@mui/material";
import ProductCard from "@/components/ProductCard/ProductCard";
import ShopFilters from "@/components/ShopFilters/ShopFilters";
import { listProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { mapProductListItemToCardProduct } from "@/lib/map-product-list-item-to-card";
import type { productType } from "@/types/types";
import type { ProductCondition } from "@/lib/api/products";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 16;

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const searchQuery = typeof sp.search === "string" ? sp.search.trim() : "";
  const categoryId =
    typeof sp.categoryId === "string" ? sp.categoryId : undefined;
  const condition =
    typeof sp.condition === "string"
      ? (sp.condition as ProductCondition)
      : undefined;
  const minPrice = typeof sp.minPrice === "string" ? sp.minPrice : undefined;
  const maxPrice = typeof sp.maxPrice === "string" ? sp.maxPrice : undefined;
  const page =
    typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  let products: productType[] = [];
  let totalPages = 1;
  let total = 0;
  let fetchError: string | null = null;
  let categories: { id: string; name: string }[] = [];

  try {
    const [productResult, categoriesResult] = await Promise.all([
      listProducts({
        q: searchQuery || undefined,
        status: "active",
        categoryId,
        condition,
        minPrice,
        maxPrice,
        page,
        pageSize: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
      listCategories({ page: 1, pageSize: 100, isActive: true }),
    ]);
    products = productResult.data.map(mapProductListItemToCardProduct);
    totalPages = productResult.meta.totalPages;
    total = productResult.meta.total;
    categories = categoriesResult.data.map(({ id, name }) => ({ id, name }));
  } catch {
    fetchError = "Could not load products.";
  }

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (categoryId) params.set("categoryId", categoryId);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", String(p));
    return `/shop?${params.toString()}`;
  };

  return (
    <Box sx={{ flex: 1, backgroundColor: "rgb(255, 255, 255)" }}>
      <Suspense>
        <ShopFilters categories={categories} />
      </Suspense>

      <Box sx={{ px: 4, pb: 4 }}>
        {searchQuery && (
          <Typography variant="body1" sx={{ color: "rgb(0, 62, 219)", mb: 2 }}>
            {products.length > 0
              ? `Mostrando ${total} resultado(s) para "${searchQuery}"`
              : `Sin resultados para "${searchQuery}"`}
          </Typography>
        )}

        {fetchError && (
          <Typography variant="body1" sx={{ color: "red", mb: 2 }}>
            {fetchError}
          </Typography>
        )}

        {products.length > 0 ? (
          <>
            <Grid container spacing={3} sx={{ justifyContent: "flex-start" }}>
              {products.map((product) => (
                <Grid key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid rgb(220, 226, 240)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgb(131, 148, 189)" }}
                >
                  Página {page} de {totalPages} · {total} productos
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Link
                    href={buildPageUrl(page - 1)}
                    aria-disabled={page <= 1}
                    style={{
                      pointerEvents: page <= 1 ? "none" : "auto",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor:
                        page <= 1 ? "rgb(220, 226, 240)" : "rgb(180, 190, 210)",
                      color:
                        page <= 1 ? "rgb(189, 197, 217)" : "rgb(0, 28, 100)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    Anterior
                  </Link>
                  <Link
                    href={buildPageUrl(page + 1)}
                    aria-disabled={page >= totalPages}
                    style={{
                      pointerEvents: page >= totalPages ? "none" : "auto",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor:
                        page >= totalPages
                          ? "rgb(220, 226, 240)"
                          : "rgb(180, 190, 210)",
                      color:
                        page >= totalPages
                          ? "rgb(189, 197, 217)"
                          : "rgb(0, 28, 100)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    Siguiente
                  </Link>
                </Box>
              </Box>
            )}
          </>
        ) : (
          !fetchError && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
              }}
            >
              <Typography variant="h6" sx={{ color: "rgb(189, 197, 217)" }}>
                No se encontraron productos
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}
