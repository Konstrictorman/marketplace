"use client";

import { useEffect, useState } from "react";
import { getProductRating } from "@/lib/api/products";

const DEFAULT_RATING = "0.00";

export function useProductRating(productId: string, enabled = true) {
  const [rating, setRating] = useState(DEFAULT_RATING);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getProductRating(productId)
      .then((result) => {
        if (!cancelled) setRating(result.rating);
      })
      .catch(() => {
        if (!cancelled) setRating(DEFAULT_RATING);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, enabled]);

  return { rating, loading };
}
