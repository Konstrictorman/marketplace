"use client";

import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import type { BestSeller } from "@/lib/api/dashboard";

type TopBestSellersBarChartProps = {
  sellers: BestSeller[];
};

function truncateTitle(title: string, maxLength = 28): string {
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength - 1)}…`;
}

export default function TopBestSellersBarChart({
  sellers,
}: TopBestSellersBarChartProps) {
  const labels = sellers.map((seller) => truncateTitle(seller.productTitle));
  const quantities = sellers.map((seller) => seller.quantitySold);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mt: 3,
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
        Top 5 best sellers
      </Typography>

      {sellers.length === 0 ? (
        <Typography variant="body2" sx={{ color: "rgb(76, 98, 153)" }}>
          No completed sales yet. Data appears when orders are confirmed or
          delivered.
        </Typography>
      ) : (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <BarChart
            hideLegend
            layout="horizontal"
            yAxis={[
              {
                scaleType: "band",
                data: labels,
              },
            ]}
            xAxis={[{ label: "Units sold" }]}
            series={[
              {
                data: quantities,
                color: "rgb(24, 62, 157)",
                valueFormatter: (value) =>
                  value === null
                    ? ""
                    : `${value} unit${value === 1 ? "" : "s"}`,
              },
            ]}
            height={56 * sellers.length + 48}
            width={680}
            margin={{ left: 120, right: 24, top: 8, bottom: 32 }}
            grid={{ vertical: true }}
          />
        </Box>
      )}
    </Box>
  );
}
