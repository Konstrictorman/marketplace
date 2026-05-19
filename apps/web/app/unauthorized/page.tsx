"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";

export default function UnauthorizedPage() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        px: 3,
        py: 8,
        backgroundColor: "rgb(239, 241, 244)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgb(254, 254, 254)",
          borderRadius: "16px",
          boxShadow: "0px 8px 40px rgba(76, 98, 153, 0.2)",
          p: 4,
        }}
      >
        <Image
          src="/images/not-authorized.webp"
          alt="Access not allowed"
          width={320}
          height={240}
          priority
          style={{
            width: "100%",
            maxWidth: 320,
            height: "auto",
            objectFit: "contain",
          }}
        />

        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "rgb(0, 28, 100)",
            mt: 2,
            textAlign: "center",
          }}
        >
          Access not allowed
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgb(76, 98, 153)",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          You do not have permission to view this page. Contact an administrator
          if you believe this is a mistake.
        </Typography>

        <Link href="/" style={{ textDecoration: "none", marginTop: 8 }}>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              px: 4,
              py: 1.2,
              backgroundColor: "rgb(24, 62, 157)",
              "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
            }}
          >
            Back to home
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
