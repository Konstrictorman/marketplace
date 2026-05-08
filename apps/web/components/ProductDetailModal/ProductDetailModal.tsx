"use client";
import {
  Typography,
  Box,
  Modal,
  Button,
  Chip,
  Divider,
  Rating,
} from "@mui/material";
import { productType } from "../ProductCard/ProductCard.types";

type ProductDetailModalProps = {
  open: boolean;
  onClose: () => void;
  product: productType;
};

const ProductDetailModal = ({
  open,
  onClose,
  product,
}: ProductDetailModalProps) => {
  const inStock = product.stock > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500 },
          bgcolor: "rgb(254, 254, 254)",
          borderRadius: "16px",
          boxShadow: "0px 8px 40px rgba(76, 98, 153, 0.3)",
          p: 4,
          outline: "none",
        }}
      >
        {/* Image */}
        <Box
          component="img"
          src={product.image}
          alt={product.name}
          sx={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            borderRadius: "10px",
            mb: 2,
          }}
        />

        {/* Condition + Rating row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Chip
            label={product.condition === "new" ? "New" : "Used"}
            size="small"
            sx={{
              backgroundColor:
                product.condition === "new"
                  ? "rgb(24, 62, 157)"
                  : "rgb(131, 148, 189)",
              color: "rgb(254, 254, 254)",
              fontWeight: "bold",
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Rating
              value={product.rating}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography variant="body2" sx={{ color: "rgb(131, 148, 189)" }}>
              ({product.rating})
            </Typography>
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)", mb: 1 }}
        >
          {product.name}
        </Typography>

        {/* Price */}
        <Typography
          variant="h4"
          sx={{ color: "rgb(29, 54, 120)", fontWeight: "bold", mb: 2 }}
        >
          ${product.price.toFixed(2)}
        </Typography>

        <Divider sx={{ borderColor: "rgb(189, 197, 217)", mb: 2 }} />

        {/* Description */}
        <Typography
          variant="body1"
          sx={{ color: "rgb(76, 98, 153)", mb: 3, lineHeight: 1.8 }}
        >
          {product.description}
        </Typography>

        {/* Stock */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
          >
            Availability:
          </Typography>
          <Chip
            label={inStock ? `${product.stock} in stock` : "Out of stock"}
            color={inStock ? "success" : "error"}
            size="small"
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{
              borderRadius: "10px",
              py: 1.2,
              borderColor: "rgb(24, 62, 157)",
              color: "rgb(24, 62, 157)",
              "&:hover": {
                borderColor: "rgb(29, 54, 120)",
                backgroundColor: "rgba(24, 62, 157, 0.05)",
              },
            }}
          >
            Close
          </Button>

          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "10px",
              py: 1.2,
              backgroundColor: "rgb(24, 62, 157)",
              "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProductDetailModal;
