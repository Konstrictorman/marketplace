import { Alert, Box, Typography } from "@mui/material";
import CategorySalesPieChart from "@/components/Dashboard/CategorySalesPieChart";
import { getSalesByCategory } from "@/lib/api/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let slices: Awaited<ReturnType<typeof getSalesByCategory>> = [];
  let fetchError: string | null = null;

  try {
    slices = await getSalesByCategory();
  } catch {
    fetchError = "Could not load sales by category.";
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

        {fetchError ? (
          <Alert severity="error" sx={{ mt: 3, width: "100%", maxWidth: 520 }}>
            {fetchError}
          </Alert>
        ) : (
          <CategorySalesPieChart slices={slices} />
        )}
      </Box>
    </Box>
  );
}
