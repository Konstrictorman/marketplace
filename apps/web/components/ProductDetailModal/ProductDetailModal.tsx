"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Modal,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Rating,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import type { ProductListItem, ProductStatus } from "@/lib/api/products";
import { updateProduct } from "@/lib/api/products";
import { isApiError } from "@/lib/api/client";
import { useCart } from "@/context/CartContext";
import ChatButton from "../ChatButton/ChatButton";
import ProductCardImage from "@/components/ProductCard/ProductCardImage";
import { useProductRating } from "@/hooks/useProductRating";
import {
  conditionLabel,
  formatProductRating,
  parseProductPrice,
  parseProductRating,
  productStatusChipColor,
  productStatusLabel,
} from "@/lib/product-helpers";

type ProductDetailModalProps = {
  open: boolean;
  onClose: () => void;
  product: ProductListItem;
  manageMode?: boolean;
};

const ProductDetailModal = ({
  open,
  onClose,
  product,
  manageMode = false,
}: ProductDetailModalProps) => {
  const router = useRouter();
  const [localProduct, setLocalProduct] = useState<ProductListItem | null>(
    null,
  );
  const [amount, setAmount] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(
    null,
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const displayProduct = localProduct ?? product;
  const { rating: ratingValue } = useProductRating(displayProduct.id, open);

  const handleClose = () => {
    setLocalProduct(null);
    setAmount(1);
    setStatusError(null);
    onClose();
  };

  const inStock = displayProduct.inventory > 0;
  const price = parseProductPrice(displayProduct.price);
  const productRating = parseProductRating(ratingValue);
  const statusActionLabel =
    displayProduct.status === "active" ? "Inactivate" : "Activate";
  const nextStatus: ProductStatus =
    displayProduct.status === "active" ? "inactive" : "active";

  const increase = () => {
    if (amount < displayProduct.inventory) setAmount(amount + 1);
  };

  const decrease = () => {
    if (amount > 1) setAmount(amount - 1);
  };

  const { addToCart } = useCart();

  const handleStatusButtonClick = () => {
    setStatusError(null);
    setPendingStatus(nextStatus);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!pendingStatus) return;
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      const result = await updateProduct(displayProduct.id, {
        sellerId: displayProduct.sellerId,
        status: pendingStatus,
      });
      setLocalProduct(result.data);
      setStatusDialogOpen(false);
      setSuccessToast(
        pendingStatus === "active"
          ? "Producto activado exitósamente"
          : "Producto inactivado exitósamente",
      );
      setPendingStatus(null);
      router.refresh();
    } catch (e) {
      const message = isApiError(e)
        ? e.message
        : "Could not update product status. Please try again.";
      setStatusError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusDialogTitle =
    pendingStatus === "active" ? "Activate product?" : "Inactivate product?";
  const statusDialogVerb =
    pendingStatus === "active" ? "activate" : "inactivate";

  return (
    <>
      <Modal open={open} onClose={handleClose}>
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
          <IconButton
            onClick={handleClose}
            aria-label="Close"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "rgb(131, 148, 189)",
              "&:hover": {
                color: "rgb(0, 28, 100)",
                backgroundColor: "rgba(24, 62, 157, 0.08)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1,
              minWidth: 0,
            }}
          >
            <Chip
              label={conditionLabel(displayProduct.condition)}
              size="small"
              sx={{
                flexShrink: 0,
                backgroundColor:
                  displayProduct.condition === "new"
                    ? "rgb(24, 62, 157)"
                    : "rgb(131, 148, 189)",
                color: "rgb(254, 254, 254)",
                fontWeight: "bold",
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "rgb(0, 28, 100)",
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayProduct.title}
            </Typography>
          </Box>

          <ProductCardImage
            mainImageUrl={displayProduct.mainImageUrl}
            alt={displayProduct.title}
            height={220}
            sx={{ borderRadius: "10px", mb: 2 }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 2,
              minWidth: 0,
            }}
          >
            <Typography
              variant="h4"
              sx={{ color: "rgb(29, 54, 120)", fontWeight: "bold" }}
            >
              ${price.toFixed(2)}
            </Typography>
            <Chip
              label={productStatusLabel(displayProduct.status)}
              size="small"
              color={productStatusChipColor(displayProduct.status)}
              sx={{ flexShrink: 0, fontWeight: "bold" }}
            />
          </Box>

          <Divider sx={{ borderColor: "rgb(189, 197, 217)", mb: 2 }} />

          <Typography
            variant="body1"
            sx={{ color: "rgb(76, 98, 153)", mb: 2, lineHeight: 1.8 }}
          >
            {displayProduct.description}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
              flexWrap: "nowrap",
              overflow: "hidden",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontWeight: "bold",
                  color: "rgb(0, 28, 100)",
                  flexShrink: 0,
                }}
              >
                Sold By:
              </Typography>
              <Typography
                variant="body2"
                component="span"
                noWrap
                sx={{ color: "rgb(76, 98, 153)", flexShrink: 1, minWidth: 0 }}
              >
                {displayProduct.sellerUserName}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "nowrap",
                overflow: "hidden",
              }}
            >
              <Rating
                value={productRating}
                precision={0.5}
                readOnly
                size="small"
                sx={{ flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                component="span"
                sx={{ color: "rgb(131, 148, 189)", flexShrink: 0 }}
              >
                ({formatProductRating(ratingValue)}/5)
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
              flexWrap: "nowrap",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
              >
                Availability:
              </Typography>
              <Chip
                label={
                  inStock
                    ? `${displayProduct.inventory} in stock`
                    : "Out of stock"
                }
                color={inStock ? "success" : "error"}
                size="small"
              />
            </Box>

            {inStock && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
                >
                  Amount:
                </Typography>
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
                  disabled={amount >= displayProduct.inventory}
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
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
            {manageMode ? (
              <Button
                variant="contained"
                onClick={handleStatusButtonClick}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  borderRadius: "10px",
                  py: 1.2,
                  backgroundColor: "rgb(24, 62, 157)",
                  "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
                }}
              >
                {statusActionLabel}
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={!inStock}
                onClick={() => {
                  addToCart(displayProduct, amount);
                  handleClose();
                }}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  borderRadius: "10px",
                  py: 1.2,
                  backgroundColor: "rgb(24, 62, 157)",
                  "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
                }}
              >
                Add to Cart
              </Button>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ChatButton
                variant="modal"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("openChatDrawer"));
                  handleClose();
                }}
              />
            </Box>
          </Box>
        </Box>
      </Modal>

      <Dialog
        open={statusDialogOpen}
        onClose={() => {
          if (!isUpdatingStatus) {
            setStatusDialogOpen(false);
            setPendingStatus(null);
            setStatusError(null);
          }
        }}
      >
        <DialogTitle>{statusDialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {statusDialogVerb}{" "}
            <strong>{displayProduct.title}</strong>?
          </DialogContentText>
          {statusError && (
            <Typography variant="body2" sx={{ color: "error.main", mt: 1 }}>
              {statusError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setStatusDialogOpen(false);
              setPendingStatus(null);
              setStatusError(null);
            }}
            disabled={isUpdatingStatus}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleStatusConfirm}
            disabled={isUpdatingStatus}
            sx={{ textTransform: "none", color: "rgb(24, 62, 157)" }}
          >
            {isUpdatingStatus ? "Updating…" : statusActionLabel}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(successToast)}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSuccessToast(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessToast(null)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successToast}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductDetailModal;
