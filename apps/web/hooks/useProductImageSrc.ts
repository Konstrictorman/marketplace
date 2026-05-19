"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  productImageUrl,
} from "@/lib/product-helpers";

/** Resolves product image URL; falls back to placeholder on load error or missing URL. */
export function useProductImageSrc(mainImageUrl: string | null) {
  const [src, setSrc] = useState(() => productImageUrl(mainImageUrl));

  useEffect(() => {
    setSrc(productImageUrl(mainImageUrl));
  }, [mainImageUrl]);

  const onError = useCallback(() => {
    setSrc((current) =>
      current === PRODUCT_PLACEHOLDER_IMAGE ? current : PRODUCT_PLACEHOLDER_IMAGE,
    );
  }, []);

  return { src, onError };
}
