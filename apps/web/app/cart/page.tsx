"use client";
import {
  Box, Typography, Button, Checkbox,
  Divider, IconButton, Card, CardMedia
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateAmount,
    toggleSelected,
    toggleSelectAll,
    clearCart,
  } = useCart();

  const selectedItems = items.filter(item => item.selected);
  const total = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.amount, 0
  );
  const allSelected = items.length > 0 && items.every(item => item.selected);

  if (items.length === 0) {
    return (
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 8,
      }}>
        <Typography variant="h5" sx={{ color: 'rgb(0, 28, 100)', fontWeight: 'bold' }}>
          Your cart is empty
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgb(76, 98, 153)' }}>
          Go back to the shop and add some products!
        </Typography>
        <Button
          variant="contained"
          component={Link}
          href="/comprar"
          sx={{
            mt: 1,
            borderRadius: '10px',
            backgroundColor: 'rgb(24, 62, 157)',
            '&:hover': { backgroundColor: 'rgb(29, 54, 120)' }
          }}
        >
          Go to Shop
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      gap: 3,
      p: 4,
      alignItems: 'flex-start',
      backgroundColor: 'rgb(239, 241, 244)',
    }}>

      {/* Left side — product list */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Select all row */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'rgb(254, 254, 254)',
          borderRadius: '12px',
          px: 2,
          py: 1,
        }}>
          <Checkbox
            checked={allSelected}
            onChange={toggleSelectAll}
            sx={{ color: 'rgb(24, 62, 157)', '&.Mui-checked': { color: 'rgb(24, 62, 157)' } }}
          />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'rgb(0, 28, 100)', flex: 1 }}>
            Select All ({items.length} items)
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={clearCart}
            sx={{ color: 'rgb(131, 148, 189)', fontSize: '0.8rem' }}
          >
            Remove All
          </Button>
        </Box>

        {/* Cart items */}
        {items.map(item => (
          <Card key={item.product.id} sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: '12px',
            boxShadow: '0px 2px 10px rgba(76, 98, 153, 0.15)',
          }}>

            {/* Checkbox */}
            <Checkbox
              checked={item.selected}
              onChange={() => toggleSelected(item.product.id)}
              sx={{ color: 'rgb(24, 62, 157)', '&.Mui-checked': { color: 'rgb(24, 62, 157)' } }}
            />

            {/* Image */}
            <CardMedia
              component="img"
              image={item.product.image}
              alt={item.product.name}
              sx={{ width: 80, height: 80, borderRadius: '8px', objectFit: 'cover' }}
            />

            {/* Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'rgb(0, 28, 100)' }}>
                {item.product.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgb(131, 148, 189)' }}>
                {item.product.condition === "new" ? "New" : "Used"}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgb(29, 54, 120)', fontWeight: 'bold', mt: 0.5 }}>
                ${item.product.price.toFixed(2)}
              </Typography>
            </Box>

            {/* Amount selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => updateAmount(item.product.id, item.amount - 1)}
                disabled={item.amount <= 1}
                sx={{
                  border: '1px solid rgb(24, 62, 157)',
                  color: 'rgb(24, 62, 157)',
                  '&:disabled': { borderColor: 'rgb(189, 197, 217)' }
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>

              <Typography variant="body1" sx={{
                minWidth: '32px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'rgb(0, 28, 100)',
              }}>
                {item.amount}
              </Typography>

              <IconButton
                size="small"
                onClick={() => updateAmount(item.product.id, item.amount + 1)}
                disabled={item.amount >= item.product.stock}
                sx={{
                  border: '1px solid rgb(24, 62, 157)',
                  color: 'rgb(24, 62, 157)',
                  '&:disabled': { borderColor: 'rgb(189, 197, 217)' }
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Subtotal */}
            <Typography variant="body1" sx={{
              fontWeight: 'bold',
              color: 'rgb(29, 54, 120)',
              minWidth: '80px',
              textAlign: 'right',
            }}>
              ${(item.product.price * item.amount).toFixed(2)}
            </Typography>

            {/* Delete */}
            <IconButton
              onClick={() => removeFromCart(item.product.id)}
              sx={{ color: 'rgb(131, 148, 189)', '&:hover': { color: 'red' } }}
            >
              <DeleteIcon />
            </IconButton>

          </Card>
        ))}
      </Box>

      {/* Right side — order summary */}
      <Box sx={{
        width: 300,
        backgroundColor: 'rgb(254, 254, 254)',
        borderRadius: '16px',
        boxShadow: '0px 4px 20px rgba(76, 98, 153, 0.15)',
        p: 3,
        position: 'sticky',
        top: 16,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'rgb(0, 28, 100)', mb: 2 }}>
          Order Summary
        </Typography>

        <Divider sx={{ borderColor: 'rgb(189, 197, 217)', mb: 2 }} />

        {/* Selected items breakdown */}
        {selectedItems.map(item => (
          <Box key={item.product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgb(76, 98, 153)', maxWidth: '170px' }} noWrap>
              {item.product.name} x{item.amount}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgb(0, 28, 100)', fontWeight: 'bold' }}>
              ${(item.product.price * item.amount).toFixed(2)}
            </Typography>
          </Box>
        ))}

        {selectedItems.length === 0 && (
          <Typography variant="body2" sx={{ color: 'rgb(131, 148, 189)', mb: 2 }}>
            No items selected
          </Typography>
        )}

        <Divider sx={{ borderColor: 'rgb(189, 197, 217)', my: 2 }} />

        {/* Total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'rgb(0, 28, 100)' }}>
            Total
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'rgb(29, 54, 120)' }}>
            ${total.toFixed(2)}
          </Typography>
        </Box>

        {/* Buttons */}
        <Button
          variant="contained"
          fullWidth
          disabled={selectedItems.length === 0}
          sx={{
            borderRadius: '10px',
            py: 1.2,
            mb: 1,
            backgroundColor: 'rgb(24, 62, 157)',
            '&:hover': { backgroundColor: 'rgb(29, 54, 120)' },
            '&:disabled': { backgroundColor: 'rgb(189, 197, 217)' }
          }}
        >
          Confirm Purchase
        </Button>

        <Button
          variant="outlined"
          fullWidth
          component={Link}
          href="/comprar"
          sx={{
            borderRadius: '10px',
            py: 1.2,
            borderColor: 'rgb(24, 62, 157)',
            color: 'rgb(24, 62, 157)',
            '&:hover': {
              borderColor: 'rgb(29, 54, 120)',
              backgroundColor: 'rgba(24, 62, 157, 0.05)',
            }
          }}
        >
          Continue Shopping
        </Button>

      </Box>
    </Box>
  );
}