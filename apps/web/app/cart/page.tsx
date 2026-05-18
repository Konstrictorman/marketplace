"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Card,
  CardMedia,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/api/orders";
import { getAuthSession } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/client";
import type { OrderDetail } from "@/lib/api/orders";
import { useNotifications } from "@/context/NotificationContext";

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
  const [completedOrders, setCompletedOrders] = useState<OrderDetail[]>([]);
  const { addNotification } = useNotifications();
  const selectedItems = items.filter((item) => item.selected);
  const total = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.amount,
    0,
  );
  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const handleConfirmPurchase = async () => {
    if (selectedItems.length === 0) return;

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const session = await getAuthSession();
      if (!session.authenticated) {
        setOrderError("You must be logged in to place an order.");
        return;
      }

      const order = await createOrder({
        buyerId: session.userId,
        items: selectedItems.map((item) => ({
          productId: String(item.product.id),
          quantity: item.amount,
        })),
      });
      setCompletedOrders((prev) => [...prev, order.data]);
      addNotification("Tu compra fue realizada exitosamente.", "purchase");
      selectedItems.forEach((item) => removeFromCart(item.product.id));
    } catch (e: unknown) {
      const message = isApiError(e)
        ? e.message
        : "Could not place order. Please try again.";
      setOrderError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "cancelled":
        return "error";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      default:
        return "warning";
    }
  };

  if (items.length === 0 && completedOrders.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          py: 8,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "rgb(0, 28, 100)", fontWeight: "bold" }}
        >
          Your cart is empty
        </Typography>
        <Typography variant="body1" sx={{ color: "rgb(76, 98, 153)" }}>
          Go back to the shop and add some products!
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
    );
  }

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
      {items.length > 0 && (
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
                  image={item.product.image}
                  alt={item.product.name}
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
                    {item.product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgb(131, 148, 189)" }}
                  >
                    {item.product.condition === "new" ? "New" : "Used"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgb(29, 54, 120)",
                      fontWeight: "bold",
                      mt: 0.5,
                    }}
                  >
                    ${item.product.price.toFixed(2)}
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
                    disabled={item.amount >= item.product.stock}
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
                  ${(item.product.price * item.amount).toFixed(2)}
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
                  {item.product.name} x{item.amount}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgb(0, 28, 100)", fontWeight: "bold" }}
                >
                  ${(item.product.price * item.amount).toFixed(2)}
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
      {completedOrders.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)", mb: 2 }}
          >
            Your Orders
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {completedOrders.map((order) => (
              <Card
                key={order.id}
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0px 2px 10px rgba(76, 98, 153, 0.15)",
                  p: 3,
                }}
              >
                {/* Order header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgb(131, 148, 189)" }}
                    >
                      Order ID
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        color: "rgb(0, 28, 100)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {order.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={order.status}
                    color={
                      statusColor(order.status) as
                        | "success"
                        | "error"
                        | "warning"
                        | "info"
                    }
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                  />
                </Box>

                <Divider sx={{ borderColor: "rgb(189, 197, 217)", mb: 2 }} />

                {/* Order items */}
                {order.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "rgb(76, 98, 153)" }}
                    >
                      Product ID: {item.productId} x{item.quantity}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", color: "rgb(0, 28, 100)" }}
                    >
                      ${item.subtotal}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ borderColor: "rgb(189, 197, 217)", my: 2 }} />

                {/* Total */}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
                    ${order.totalAmount}
                  </Typography>
                </Box>

                {/* Date */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgb(131, 148, 189)",
                    mt: 1,
                    textAlign: "right",
                  }}
                >
                  {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
