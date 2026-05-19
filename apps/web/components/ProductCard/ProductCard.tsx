"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Rating,
  Box,
} from "@mui/material";
import ProductDetailModal from "@/components/ProductDetailModal/ProductDetailModal";
import ProductCardImage from "@/components/ProductCard/ProductCardImage";
import type { ProductListItem } from "@/lib/api/products";
import { useProductRating } from "@/hooks/useProductRating";
import {
  formatProductRating,
  parseProductPrice,
  parseProductRating,
} from "@/lib/product-helpers";

type ProductCardProps = {
  product: ProductListItem;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const ProductCard = ({
  product,
  isOwner = false,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  const pathname = usePathname();
  const isManageRoute = pathname === "/manage";
  const [open, setOpen] = useState(false);
  const price = parseProductPrice(product.price);
  const { rating: ratingValue } = useProductRating(product.id);
  const productRating = parseProductRating(ratingValue);
  const isInactive = product.status === "inactive";

  return (
    <>
      <Card
        onClick={isOwner ? undefined : () => setOpen(true)}
        sx={{
          width: 280,
          borderRadius: "16px",
          backgroundColor: "rgb(254, 254, 254)",
          boxShadow: "0px 4px 20px rgba(76, 98, 153, 0.2)",
          transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
          cursor: isOwner ? undefined : "pointer",
          ...(isInactive && {
            opacity: 0.5,
            "&:hover": {
              transform: "none",
              boxShadow: "0px 4px 20px rgba(76, 98, 153, 0.2)",
            },
          }),
          ...(!isInactive && {
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0px 8px 30px rgba(76, 98, 153, 0.4)",
            },
          }),
        }}
      >
        <ProductCardImage
          mainImageUrl={product.mainImageUrl}
          alt={product.title}
        />

        <CardContent sx={{ padding: "16px" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              color: "rgb(0, 28, 100)",
              marginBottom: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 1,
            }}
          >
            <Rating
              value={productRating}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography
              variant="caption"
              sx={{ color: "rgb(131, 148, 189)" }}
            >
              ({formatProductRating(ratingValue)}/5)
            </Typography>
          </Box>

          <Typography
            variant="h5"
            sx={{
              color: "rgb(29, 54, 120)",
              fontWeight: "bold",
              marginBottom: 1,
            }}
          >
            ${price.toFixed(2)}
          </Typography>
        </CardContent>

        {isOwner && (
          <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                borderColor: "rgb(24, 62, 157)",
                color: "rgb(24, 62, 157)",
                "&:hover": {
                  borderColor: "rgb(29, 54, 120)",
                  backgroundColor: "rgba(24, 62, 157, 0.05)",
                },
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                borderColor: "red",
                color: "red",
                "&:hover": {
                  borderColor: "darkred",
                  backgroundColor: "rgba(255, 0, 0, 0.05)",
                },
              }}
            >
              Delete
            </Button>
          </CardActions>
        )}
      </Card>

      {!isOwner && (
        <ProductDetailModal
          open={open}
          onClose={() => setOpen(false)}
          product={product}
          manageMode={isManageRoute}
        />
      )}
    </>
  );
};

export default ProductCard;
