import { Alert, Box, Typography } from "@mui/material";
import CategorySalesPieChart from "@/components/Dashboard/CategorySalesPieChart";
import ProductsPublishedSparkline from "@/components/Dashboard/ProductsPublishedSparkline";
import TopBestSellersBarChart from "@/components/Dashboard/TopBestSellersBarChart";
import {
  getProductsPublishedLastMonth,
  getSalesByCategory,
  getTopBestSellers,
} from "@/lib/api/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let slices: Awaited<ReturnType<typeof getSalesByCategory>> = [];
  let publishedPoints: Awaited<
    ReturnType<typeof getProductsPublishedLastMonth>
  > = [];
  let bestSellers: Awaited<ReturnType<typeof getTopBestSellers>> = [];
  let salesError: string | null = null;
  let publishedError: string | null = null;
  let bestSellersError: string | null = null;

  const [salesResult, publishedResult, bestSellersResult] =
    await Promise.allSettled([
      getSalesByCategory(),
      getProductsPublishedLastMonth(),
      getTopBestSellers(),
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

  if (bestSellersResult.status === "fulfilled") {
    bestSellers = bestSellersResult.value;
  } else {
    bestSellersError = "Could not load top best sellers.";
  }

  const hasChartErrors = salesError || publishedError || bestSellersError;

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

        {hasChartErrors ? (
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
            {bestSellersError ? (
              <Alert severity="error">{bestSellersError}</Alert>
            ) : null}
          </Box>
        ) : null}

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

        {!bestSellersError ? (
          <TopBestSellersBarChart sellers={bestSellers} />
        ) : null}
      </Box>
    </Box>
  );
}
