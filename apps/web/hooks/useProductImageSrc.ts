"use client";

import { useCallback, useState } from "react";
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  productImageUrl,
} from "@/lib/product-helpers";

/** Resolves product image URL; falls back to placeholder on load error or missing URL. */
export function useProductImageSrc(mainImageUrl: string | null) {
  const resolvedUrl = productImageUrl(mainImageUrl);
  const [loadFailed, setLoadFailed] = useState(false);

  const [prevMainImageUrl, setPrevMainImageUrl] = useState(mainImageUrl);
  if (mainImageUrl !== prevMainImageUrl) {
    setPrevMainImageUrl(mainImageUrl);
    setLoadFailed(false);
  }

  const src = loadFailed ? PRODUCT_PLACEHOLDER_IMAGE : resolvedUrl;

  const onError = useCallback(() => {
    setLoadFailed(true);
  }, []);

  return { src, onError };
}
