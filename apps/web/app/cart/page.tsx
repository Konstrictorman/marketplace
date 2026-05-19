"use client";
import { useState } from "react";
import {
  Alert,
  Box,
  Typography,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Card,
  CardMedia,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  conditionLabel,
  parseProductPrice,
  productImageUrl,
} from "@/lib/product-helpers";
import { getAuthSession } from "@/lib/api/auth";
import { getExpressApiBaseUrl, isApiError } from "@/lib/api/client";
import { createOrder } from "@/lib/api/orders";

const CHECKOUT_LOG = "[checkout]";

function logCheckout(
  phase: string,
  data?: Record<string, unknown>,
): void {
  console.log(CHECKOUT_LOG, phase, data ?? "");
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateAmount,
    toggleSelected,
    toggleSelectAll,
    clearCart,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const selectedItems = items.filter((item) => item.selected);
  const total = selectedItems.reduce(
    (sum, item) => sum + parseProductPrice(item.product.price) * item.amount,
    0,
  );
  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const handleConfirmPurchase = async () => {
    if (selectedItems.length === 0) return;

    setIsSubmitting(true);
    setOrderError(null);

    const apiBaseUrl = getExpressApiBaseUrl();
    const orderPayload = {
      items: selectedItems.map((item) => ({
        productId: item.product.id,
        quantity: item.amount,
        title: item.product.title,
      })),
    };

    logCheckout("start", {
      pageOrigin: window.location.origin,
      apiBaseUrl,
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL ?? "(unset → localhost:3001)",
      selectedItemCount: selectedItems.length,
      total: total.toFixed(2),
      items: orderPayload.items,
    });

    try {
      logCheckout("auth.session.request");
      const session = await getAuthSession();
      logCheckout("auth.session.response", {
        authenticated: session.authenticated,
        ...(session.authenticated
          ? { userId: session.userId, roles: session.roles }
          : {}),
      });

      if (!session.authenticated) {
        logCheckout("auth.session.rejected", {
          reason: "not authenticated",
        });
        setOrderError("You must be logged in to place an order.");
        return;
      }

      const createBody = {
        buyerId: session.userId,
        items: orderPayload.items.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
      };

      logCheckout("createOrder.request", {
        url: `${apiBaseUrl}/api/orders`,
        body: createBody,
      });

      const result = await createOrder(createBody);

      logCheckout("createOrder.success", {
        orderId: result.data.id,
        status: result.data.status,
        totalAmount: result.data.totalAmount,
        itemCount: result.data.items.length,
      });

      selectedItems.forEach((item) => removeFromCart(item.product.id));
      setSuccessToast("Order placed successfully");
    } catch (e: unknown) {
      const diagnostics: Record<string, unknown> = {
        apiBaseUrl,
        pageOrigin: window.location.origin,
      };

      if (isApiError(e)) {
        diagnostics.status = e.status;
        diagnostics.message = e.message;
        diagnostics.details = e.details;
        console.error(CHECKOUT_LOG, "createOrder.failed (API)", diagnostics);
      } else if (e instanceof Error) {
        diagnostics.name = e.name;
        diagnostics.message = e.message;
        console.error(CHECKOUT_LOG, "createOrder.failed (Error)", diagnostics, e);
      } else {
        diagnostics.raw = e;
        console.error(CHECKOUT_LOG, "createOrder.failed (unknown)", diagnostics);
      }

      const message = isApiError(e)
        ? e.message
        : "Could not place order. Please try again.";
      setOrderError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: 4,
        backgroundColor: "rgb(239, 241, 244)",
      }}
    >
      {/* Cart + Summary row */}
      {items.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            py: 8,
          }}
        >
          <Typography variant="h5" sx={{ color: "rgb(76, 98, 153) " }}>
            Your cart is empty! Go back to the shop
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/shop"
            sx={{
              textTransform: "none",
              mt: 1,
              borderRadius: "10px",
              backgroundColor: "rgb(24, 62, 157)",
              "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
            }}
          >
            Go to Shop
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* Left side — product list */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "rgb(254, 254, 254)",
                borderRadius: "12px",
                px: 2,
                py: 1,
              }}
            >
              <Checkbox
                checked={allSelected}
                onChange={toggleSelectAll}
                sx={{
                  color: "rgb(24, 62, 157)",
                  "&.Mui-checked": { color: "rgb(24, 62, 157)" },
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)", flex: 1 }}
              >
                Select All ({items.length} items)
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={clearCart}
                sx={{
                  textTransform: "none",
                  color: "rgb(131, 148, 189)",
                  fontSize: "0.8rem",
                }}
              >
                Remove All
              </Button>
            </Box>

            {items.map((item) => (
              <Card
                key={item.product.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: "12px",
                  boxShadow: "0px 2px 10px rgba(76, 98, 153, 0.15)",
                }}
              >
                <Checkbox
                  checked={item.selected}
                  onChange={() => toggleSelected(item.product.id)}
                  sx={{
                    color: "rgb(24, 62, 157)",
                    "&.Mui-checked": { color: "rgb(24, 62, 157)" },
                  }}
                />
                <CardMedia
                  component="img"
                  image={productImageUrl(item.product.mainImageUrl)}
                  alt={item.product.title}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
                  >
                    {item.product.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgb(131, 148, 189)" }}
                  >
                    {conditionLabel(item.product.condition)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgb(29, 54, 120)",
                      fontWeight: "bold",
                      mt: 0.5,
                    }}
                  >
                    ${parseProductPrice(item.product.price).toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      updateAmount(item.product.id, item.amount - 1)
                    }
                    disabled={item.amount <= 1}
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
                    {item.amount}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      updateAmount(item.product.id, item.amount + 1)
                    }
                    disabled={item.amount >= item.product.inventory}
                    sx={{
                      border: "1px solid rgb(24, 62, 157)",
                      color: "rgb(24, 62, 157)",
                      "&:disabled": { borderColor: "rgb(189, 197, 217)" },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: "rgb(29, 54, 120)",
                    minWidth: "80px",
                    textAlign: "right",
                  }}
                >
                  $
                  {(
                    parseProductPrice(item.product.price) * item.amount
                  ).toFixed(2)}
                </Typography>

                <IconButton
                  onClick={() => removeFromCart(item.product.id)}
                  sx={{
                    color: "rgb(131, 148, 189)",
                    "&:hover": { color: "red" },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            ))}
          </Box>

          {/* Right side — order summary */}
          <Box
            sx={{
              width: 300,
              backgroundColor: "rgb(254, 254, 254)",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(76, 98, 153, 0.15)",
              p: 3,
              position: "sticky",
              top: 16,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)", mb: 2 }}
            >
              Order Summary
            </Typography>

            <Divider sx={{ borderColor: "rgb(189, 197, 217)", mb: 2 }} />

            {selectedItems.map((item) => (
              <Box
                key={item.product.id}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgb(76, 98, 153)", maxWidth: "170px" }}
                  noWrap
                >
                  {item.product.title} x{item.amount}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgb(0, 28, 100)", fontWeight: "bold" }}
                >
                  $
                  {(
                    parseProductPrice(item.product.price) * item.amount
                  ).toFixed(2)}
                </Typography>
              </Box>
            ))}

            {selectedItems.length === 0 && (
              <Typography
                variant="body2"
                sx={{ color: "rgb(131, 148, 189)", mb: 2 }}
              >
                No items selected
              </Typography>
            )}

            <Divider sx={{ borderColor: "rgb(189, 197, 217)", my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
              >
                Total
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "rgb(29, 54, 120)" }}
              >
                ${total.toFixed(2)}
              </Typography>
            </Box>

            {orderError && (
              <Typography
                variant="body2"
                sx={{ color: "error.main", mb: 2, textAlign: "center" }}
              >
                {orderError}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              disabled={selectedItems.length === 0 || isSubmitting}
              onClick={handleConfirmPurchase}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                py: 1.2,
                mb: 1,
                backgroundColor: "rgb(24, 62, 157)",
                "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
                "&:disabled": { backgroundColor: "rgb(189, 197, 217)" },
              }}
            >
              {isSubmitting ? "Placing order…" : "Confirm Purchase"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              component={Link}
              href="/shop"
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
              Continue Shopping
            </Button>
          </Box>
        </Box>
      )}

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
    </Box>
  );
}
