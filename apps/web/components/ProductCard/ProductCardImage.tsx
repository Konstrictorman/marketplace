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

function initialStatus(url: string | null): ImageStatus {
  return url ? "loading" : "empty";
}

/** Placeholder underneath; main image fades in after a successful load. */
export default function ProductCardImage({
  mainImageUrl,
  alt,
  height = 180,
  sx,
}: ProductCardImageProps) {
  const url = mainImageUrl?.trim() || null;
  const [status, setStatus] = useState<ImageStatus>(() => initialStatus(url));

  const [prevUrl, setPrevUrl] = useState(url);
  if (url !== prevUrl) {
    setPrevUrl(url);
    setStatus(initialStatus(url));
  }

  useEffect(() => {
    if (!url) return;

    const img = new window.Image();
    let cancelled = false;

    const finish = (next: "loaded" | "error") => {
      if (!cancelled) setStatus(next);
    };

    img.onload = () => finish("loaded");
    img.onerror = () => finish("error");
    img.src = url;

    if (img.complete) {
      queueMicrotask(() => {
        if (cancelled) return;
        if (img.naturalWidth > 0) finish("loaded");
        else finish("error");
      });
    }

    return () => {
      cancelled = true;
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
