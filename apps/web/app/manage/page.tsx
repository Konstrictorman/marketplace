import { Box, Grid, Typography } from "@mui/material";
import ProductCard from "@/components/ProductCard/ProductCard";
import { listProducts, type ProductListItem } from "@/lib/api/products";

export const dynamic = "force-dynamic";

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const searchQuery = typeof sp.search === "string" ? sp.search.trim() : "";

  let products: ProductListItem[] = [];
  let fetchError: string | null = null;

  try {
    const result = await listProducts({
      q: searchQuery || undefined,
      pageSize: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    products = result.data;
  } catch {
    fetchError = "Could not load products.";
  }

  return (
    <Box
      sx={{
        p: 4,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgb(255, 255, 255)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "rgb(0, 28, 100)",
            mb: 3,
            textAlign: "center",
            width: "100%",
          }}
        >
          Products Available
        </Typography>

        {searchQuery && (
          <Typography
            variant="body1"
            sx={{ color: "rgb(0, 62, 219)", mb: 2, textAlign: "center" }}
          >
            {products.length > 0
              ? `Showing ${products.length} result(s) for "${searchQuery}"`
              : `No results found for "${searchQuery}"`}
          </Typography>
        )}

        {fetchError && (
          <Typography
            variant="body1"
            sx={{ color: "red", mb: 2, textAlign: "center" }}
          >
            {fetchError}
          </Typography>
        )}

        {products.length > 0 ? (
          <Grid
            container
            spacing={3}
            sx={{ width: "100%", justifyContent: "center" }}
          >
            {products.map((product) => (
              <Grid key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          !fetchError && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
                width: "100%",
              }}
            >
              <Typography variant="h6" sx={{ color: "rgb(189, 197, 217)" }}>
                No products found
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}
