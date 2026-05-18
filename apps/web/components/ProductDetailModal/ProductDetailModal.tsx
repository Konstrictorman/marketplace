"use client";
import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Modal,
  Button,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { ProductListItem } from "@/lib/api/products";
import { useCart } from "@/context/CartContext";
import ChatButton from "../ChatButton/ChatButton";
import {
  conditionLabel,
  parseProductPrice,
  productImageUrl,
} from "@/lib/product-helpers";

type ProductDetailModalProps = {
  open: boolean;
  onClose: () => void;
  product: ProductListItem;
};

const ProductDetailModal = ({
  open,
  onClose,
  product,
}: ProductDetailModalProps) => {
  const inStock = product.inventory > 0;
  const [amount, setAmount] = useState(1);
  const price = parseProductPrice(product.price);

  const increase = () => {
    if (amount < product.inventory) setAmount(amount + 1);
  };

  const decrease = () => {
    if (amount > 1) setAmount(amount - 1);
  };

  const { addToCart } = useCart();
  const [description, setDescription] = useState<string | null>(null);
  const [descLoading, setDescLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      setDescription(null);
      setDescLoading(true);
      try {
        const res = await getProductById(product.id);
        setDescription(res.data.description);
      } catch {
        setDescription(null);
      } finally {
        setDescLoading(false);
      }
    };
    void run();
  }, [open, product.id]);

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
        <Box
          component="img"
          src={productImageUrl(product.mainImageUrl)}
          alt={product.title}
          sx={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            borderRadius: "10px",
            mb: 2,
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Chip
            label={conditionLabel(product.condition)}
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
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)", mb: 1 }}
        >
          {product.title}
        </Typography>

        <Typography
          variant="h4"
          sx={{ color: "rgb(29, 54, 120)", fontWeight: "bold", mb: 2 }}
        >
          ${price.toFixed(2)}
        </Typography>

        <Divider sx={{ borderColor: "rgb(189, 197, 217)", mb: 2 }} />

        <Typography
          variant="body1"
          sx={{ color: "rgb(76, 98, 153)", mb: 3, lineHeight: 1.8 }}
        >
          {product.description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
          >
            Availability:
          </Typography>
          <Chip
            label={inStock ? `${product.inventory} in stock` : "Out of stock"}
            color={inStock ? "success" : "error"}
            size="small"
          />
        </Box>

        {inStock && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
            >
              Amount:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={decrease}
                disabled={amount <= 1}
                size="small"
                sx={{
                  border: "1px solid rgb(24, 62, 157)",
                  color: "rgb(24, 62, 157)",
                  "&:disabled": { borderColor: "rgb(189, 197, 217)" },
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>

              <Typography
                variant="body1"
                sx={{
                  minWidth: "32px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "rgb(0, 28, 100)",
                }}
              >
                {amount}
              </Typography>

              <IconButton
                onClick={increase}
                disabled={amount >= product.inventory}
                size="small"
                sx={{
                  border: "1px solid rgb(24, 62, 157)",
                  color: "rgb(24, 62, 157)",
                  "&:disabled": { borderColor: "rgb(189, 197, 217)" },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{
              textTransform: "none",
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
            disabled={!inStock}
            onClick={() => {
              addToCart(product, amount);
              onClose();
            }}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              py: 1.2,
              backgroundColor: "rgb(24, 62, 157)",
              "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
            }}
          >
            Add to Cart
          </Button>
        </Box>
        <Box sx={{ mt: 1 }}>
          <ChatButton
            variant="modal"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openChatDrawer"));
              onClose();
            }}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default ProductDetailModal;
