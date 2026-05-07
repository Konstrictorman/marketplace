"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import ProductDetailModal from "@/components/ProductDetailModal/ProductDetailModal";

const ProductCard = () => {
  const [open, setOpen] = useState(false);

  const product = {
    name: "Product Name",
    price: 29.99,
    description:
      "This is a detailed description of the product. It explains what the product does, its key features, materials, and anything else the buyer should know before purchasing.",
    stock: 8,
  };

  return (
    <>
      <Card
        sx={{
          width: 280,
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0px 8px 30px rgba(0,0,0,0.15)",
          },
        }}
      >
        <CardContent sx={{ padding: "16px" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              marginBottom: 0.5,
            }}
          >
            {product.name}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              marginBottom: 1,
            }}
          >
            ${product.price.toFixed(2)}
          </Typography>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setOpen(true)}
            sx={{ borderRadius: "10px" }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>

      <ProductDetailModal
        open={open}
        onClose={() => setOpen(false)}
        product={product}
      />
    </>
  );
};

export default ProductCard;
