"use client";
import {
  Typography, Box, Modal,
  Button, Chip, Divider
} from "@mui/material";

const ProductDetailModal = ({ open, onClose, product }: {
  open: boolean;
  onClose: () => void;
  product: { name: string; price: number; description: string; stock: number; };
}) => {
  const inStock = product.stock > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        bgcolor: 'background.paper',
        borderRadius: '16px',
        boxShadow: '0px 8px 40px rgba(0,0,0,0.2)',
        p: 4,
        outline: 'none',
      }}>

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {product.name}
        </Typography>

        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
          ${product.price.toFixed(2)}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
          {product.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Availability:
          </Typography>
          <Chip
            label={inStock ? `${product.stock} in stock` : 'Out of stock'}
            color={inStock ? 'success' : 'error'}
            size="small"
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ borderRadius: '10px', py: 1.2 }}
        >
          Close
        </Button>

      </Box>
    </Modal>
  );
};

export default ProductDetailModal;