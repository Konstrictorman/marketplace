"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const HOME_LABEL = "HOME";

/** Pages where breadcrumbs are omitted */
const HIDDEN_PATHS = new Set(["/", "/login", "/register", "/unauthorized"]);

const SEGMENT_LABELS: Record<string, string> = {
  shop: "SHOP",
  sell: "SELL",
  orders: "MY ORDERS",
  manage: "MANAGE",
  cart: "CART",
};

function segmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.replace(/-/g, " ").toUpperCase();
}

const breadcrumbsSx = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  "& .MuiBreadcrumbs-ol": {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  "& .MuiBreadcrumbs-li": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiBreadcrumbs-separator": {
    mx: 0.5,
    color: "rgb(131, 148, 189)",
    fontWeight: 600,
  },
};

const linkSx = {
  display: "inline-flex",
  alignItems: "center",
  color: "rgb(24, 62, 157)",
  fontWeight: 600,
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
};

const currentSx = {
  display: "inline-flex",
  alignItems: "center",
  color: "rgb(0, 28, 100)",
  fontWeight: 700,
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const normalizedPath =
    pathname.replace(/\/+$/, "") === "" ? "/" : pathname.replace(/\/+$/, "");

  if (HIDDEN_PATHS.has(normalizedPath)) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [
    <MuiLink key="home" component={Link} href="/" underline="hover" sx={linkSx}>
      {HOME_LABEL}
    </MuiLink>,
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const label = segmentLabel(segment);
      const isLast = index === segments.length - 1;

      if (isLast) {
        return (
          <Typography key={href} component="span" sx={currentSx}>
            {label}
          </Typography>
        );
      }

      return (
        <MuiLink
          key={href}
          component={Link}
          href={href}
          underline="hover"
          sx={linkSx}
        >
          {label}
        </MuiLink>
      );
    }),
  ];

  return (
    <Box
      component="nav"
      aria-label="breadcrumb"
      sx={{
        px: 3,
        py: 1.25,
        backgroundColor: "rgb(239, 241, 244)",
      }}
    >
      <MuiBreadcrumbs separator="/" sx={breadcrumbsSx}>
        {crumbs}
      </MuiBreadcrumbs>
    </Box>
  );
}
