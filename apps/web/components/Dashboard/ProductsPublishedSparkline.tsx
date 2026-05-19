"use client";

import { Box, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import type { ProductsPublishedPoint } from "@/lib/api/dashboard";

type ProductsPublishedSparklineProps = {
  points: ProductsPublishedPoint[];
};

function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function ProductsPublishedSparkline({
  points,
}: ProductsPublishedSparklineProps) {
  const counts = points.map((point) => point.count);
  const dates = points.map((point) => point.date);
  const totalPublished = counts.reduce((sum, value) => sum + value, 0);

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
        sx={{ fontWeight: 600, color: "rgb(0, 28, 100)", mb: 0.5 }}
      >
        Products published
      </Typography>
      <Typography variant="body2" sx={{ color: "rgb(76, 98, 153)", mb: 2 }}>
        Last 30 days · {totalPublished} total
      </Typography>

      {points.length === 0 ? (
        <Typography variant="body2" sx={{ color: "rgb(76, 98, 153)" }}>
          No publish activity in the last month.
        </Typography>
      ) : (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <SparkLineChart
            data={counts}
            xAxis={{
              data: dates,
              scaleType: "band",
              valueFormatter: (value) => formatDayLabel(String(value)),
            }}
            height={120}
            width={420}
            showTooltip
            showHighlight
            area
            curve="natural"
            color="rgb(24, 62, 157)"
            valueFormatter={(value) =>
              value === null ? "" : `${value} product${value === 1 ? "" : "s"}`
            }
          />
        </Box>
      )}
    </Box>
  );
}
