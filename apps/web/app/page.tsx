"use client";
import Image from "next/image";
import CardMedia from "@mui/material/CardMedia"
import * as React from "react";
import {styled}from "@mui/material/styles"
import {
  Card, CardContent, CardActions,
  Typography, Box, Modal, Button,
  Chip, Divider
} from "@mui/material";
import {useState} from "react";

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

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {product.name}
        </Typography>

        {/* Price */}
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
          ${product.price.toFixed(2)}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Description */}
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
          {product.description}
        </Typography>

        {/* Stock */}
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

        {/* Close button */}
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
const ProductCard = () => {
  const [open, setOpen] = useState(false);

  // 👇 Later you'll replace this with real data from your backend
  const product = {
    name: "Product Name",
    price: 29.99,
    description: "This is a detailed description of the product. It explains what the product does, its key features, materials, and anything else the buyer should know before purchasing.",
    stock: 8,
  };

  return (
    <>
      <Card sx={{
        width: 280,
        borderRadius: '16px',
        boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0px 8px 30px rgba(0,0,0,0.15)',
        }
      }}>
        <CardContent sx={{ padding: '16px' }}>
          <Typography variant="h6" component="div" sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            marginBottom: 0.5
          }}>
            {product.name}
          </Typography>

          <Typography variant="h5" sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            marginBottom: 1
          }}>
            ${product.price.toFixed(2)}
          </Typography>
        </CardContent>

        {/* View Details button */}
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setOpen(true)}
            sx={{ borderRadius: '10px' }}
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

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          src="/images/unisabana-logo.png"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to the Sabana&apos;s Marketplace
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Work in progress...
          </p>
        </div>
        <div>
          <ProductCard/>
        </div>
        </main>
    </div>
  );
}
