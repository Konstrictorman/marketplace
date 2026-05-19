"use client";

import { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { getAuthSession } from "@/lib/api/auth";
import { hasAdminRole } from "@/lib/route-access";

export default function Home() {
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAuthSession()
      .then((session) => {
        if (cancelled) return;
        setShowManage(
          session.authenticated && hasAdminRole(session.roles),
        );
      })
      .catch(() => {
        if (!cancelled) setShowManage(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        backgroundColor: "rgb(239, 241, 244)",
        py: 8,
      }}
    >
      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "rgb(0, 28, 100)",
          textAlign: "center",
        }}
      >
        Welcome to Sabana Marketplace
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "rgb(76, 98, 153)",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        ¿Qué quieres hacer hoy?
      </Typography>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          href="/shop"
          sx={{
            textTransform: "none",
            px: 5,
            py: 1.5,
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            backgroundColor: "rgb(24, 62, 157)",
            "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
          }}
        >
          Comprar
        </Button>

        <Button
          variant="outlined"
          size="large"
          href="/sell"
          sx={{
            textTransform: "none",
            px: 5,
            py: 1.5,
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            borderColor: "rgb(24, 62, 157)",
            color: "rgb(24, 62, 157)",
            "&:hover": {
              borderColor: "rgb(29, 54, 120)",
              backgroundColor: "rgba(24, 62, 157, 0.05)",
            },
          }}
        >
          Vender
        </Button>

        {showManage ? (
          <Button
            variant="contained"
            size="large"
            href="/manage"
            sx={{
              textTransform: "none",
              px: 5,
              py: 1.5,
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              backgroundColor: "rgb(0, 0, 0)",
              "&:hover": { backgroundColor: "rgb(37, 39, 43)" },
            }}
          >
            Manage
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
