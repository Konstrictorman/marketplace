"use client";

import { useEffect, useState } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/product-helpers";

type ProductCardImageProps = {
  mainImageUrl: string | null;
  alt: string;
  height?: number | string;
  sx?: SxProps<Theme>;
};

type ImageStatus = "empty" | "loading" | "loaded" | "error";

const imageSx = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};

/** Placeholder underneath; main image fades in after a successful load. */
export default function ProductCardImage({
  mainImageUrl,
  alt,
  height = 180,
  sx,
}: ProductCardImageProps) {
  const url = mainImageUrl?.trim() || null;
  const [status, setStatus] = useState<ImageStatus>(url ? "loading" : "empty");

  useEffect(() => {
    if (!url) {
      setStatus("empty");
      return;
    }

    setStatus("loading");
    const img = new window.Image();

    const handleLoad = () => setStatus("loaded");
    const handleError = () => setStatus("error");

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = url;

    if (img.complete) {
      if (img.naturalWidth > 0) handleLoad();
      else handleError();
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  const showMain = status === "loaded";

  return (
    <Box
      sx={{
        position: "relative",
        height,
        overflow: "hidden",
        bgcolor: "rgb(240, 242, 247)",
        ...sx,
      }}
    >
      <Box
        component="img"
        src={PRODUCT_PLACEHOLDER_IMAGE}
        alt=""
        aria-hidden
        sx={imageSx}
      />
      {url ? (
        <Box
          component="img"
          src={url}
          alt={alt}
          sx={{
            ...imageSx,
            opacity: showMain ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        />
      ) : null}
    </Box>
  );
}
