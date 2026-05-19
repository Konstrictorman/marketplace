import { Alert, Box, Typography } from "@mui/material";
import CategorySalesPieChart from "@/components/Dashboard/CategorySalesPieChart";
import ProductsPublishedSparkline from "@/components/Dashboard/ProductsPublishedSparkline";
import {
  getProductsPublishedLastMonth,
  getSalesByCategory,
} from "@/lib/api/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let slices: Awaited<ReturnType<typeof getSalesByCategory>> = [];
  let publishedPoints: Awaited<ReturnType<typeof getProductsPublishedLastMonth>> =
    [];
  let salesError: string | null = null;
  let publishedError: string | null = null;

  const [salesResult, publishedResult] = await Promise.allSettled([
    getSalesByCategory(),
    getProductsPublishedLastMonth(),
  ]);

  if (salesResult.status === "fulfilled") {
    slices = salesResult.value;
  } else {
    salesError = "Could not load sales by category.";
  }

  if (publishedResult.status === "fulfilled") {
    publishedPoints = publishedResult.value;
  } else {
    publishedError = "Could not load products published.";
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
            textAlign: "center",
            width: "100%",
          }}
        >
          Dashboard
        </Typography>

        {(salesError || publishedError) && (
          <Box
            sx={{
              mt: 3,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {salesError ? <Alert severity="error">{salesError}</Alert> : null}
            {publishedError ? (
              <Alert severity="error">{publishedError}</Alert>
            ) : null}
          </Box>
        )}

        <Box
          sx={{
            mt: 4,
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "flex-start" },
            justifyContent: "center",
            gap: 3,
          }}
        >
          {!salesError ? <CategorySalesPieChart slices={slices} /> : null}
          {!publishedError ? (
            <ProductsPublishedSparkline points={publishedPoints} />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
