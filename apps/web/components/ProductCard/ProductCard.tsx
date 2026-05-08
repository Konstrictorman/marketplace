"use client";
import { useState } from "react";
import {
  Card, CardContent, CardActions, CardMedia,
  Typography, Button, Rating, Box
} from "@mui/material";
import ProductDetailModal from "@/components/ProductDetailModal/ProductDetailModal";
import { ProductCardProps } from "./ProductCard.types";

const ProductCard = ({ product }: ProductCardProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card sx={{
        width: 280,
        borderRadius: '16px',
        backgroundColor: 'rgb(254, 254, 254)',
        boxShadow: '0px 4px 20px rgba(76, 98, 153, 0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0px 8px 30px rgba(76, 98, 153, 0.4)',
        }
      }}>

        {/* Image */}
        <CardMedia
          component="img"
          height="180"
          image={product.image}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent sx={{ padding: '16px' }}>

          {/* Title */}
          <Typography variant="h6" component="div" sx={{
            fontWeight: 'bold',
            color: 'rgb(0, 28, 100)',
            marginBottom: 0.5
          }}>
            {product.name}
          </Typography>

          {/* Price */}
          <Typography variant="h5" sx={{
            color: 'rgb(29, 54, 120)',
            fontWeight: 'bold',
            marginBottom: 1
          }}>
            ${product.price.toFixed(2)}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={product.rating} precision={0.5} readOnly size="small" />
            <Typography variant="body2" sx={{ color: 'rgb(131, 148, 189)' }}>
              ({product.rating})
            </Typography>
          </Box>

        </CardContent>

        {/* Two buttons side by side */}
        <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: '10px',
              borderColor: 'rgb(24, 62, 157)',
              color: 'rgb(24, 62, 157)',
              '&:hover': {
                borderColor: 'rgb(29, 54, 120)',
                backgroundColor: 'rgba(24, 62, 157, 0.05)',
              }
            }}
          >
            Details
          </Button>

          <Button
            variant="contained"
            size="small"
            fullWidth
            sx={{
              borderRadius: '10px',
              backgroundColor: 'rgb(24, 62, 157)',
              '&:hover': { backgroundColor: 'rgb(29, 54, 120)' }
            }}
          >
            Add to Cart
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
