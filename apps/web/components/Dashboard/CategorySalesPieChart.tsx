"use client";

import { Box, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import type { CategorySalesSlice } from "@/lib/api/dashboard";

type CategorySalesPieChartProps = {
  slices: CategorySalesSlice[];
};

export default function CategorySalesPieChart({
  slices,
}: CategorySalesPieChartProps) {
  const chartData = slices.map((slice, index) => ({
    id: index,
    value: slice.quantitySold,
    label: slice.categoryName,
  }));

  return (
    <Box
      sx={{
        flex: "1 1 360px",
        minWidth: 280,
        maxWidth: 520,
        p: 3,
        borderRadius: "12px",
        border: "1px solid rgb(224, 228, 240)",
        backgroundColor: "rgb(252, 253, 255)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: "rgb(0, 28, 100)", mb: 2 }}
      >
        Sales by category
      </Typography>

      {chartData.length === 0 ? (
        <Typography variant="body2" sx={{ color: "rgb(76, 98, 153)" }}>
          No completed purchases yet. Data appears when orders are confirmed or
          delivered.
        </Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <PieChart
            series={[
              {
                data: chartData,
                highlightScope: { fade: "global", highlight: "item" },
                valueFormatter: (value) => `${value} units`,
              },
            ]}
            width={400}
            height={300}
            margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
            slotProps={{
              legend: {
                direction: "horizontal",
                position: { vertical: "bottom", horizontal: "center" },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
