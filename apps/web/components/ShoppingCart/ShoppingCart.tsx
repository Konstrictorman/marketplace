"use client";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import { useCart } from "@/context/CartContext";

export default function ShoppingCart() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      style={{
        color: "rgb(255, 255, 255)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Badge badgeContent={totalItems} color="error">
        <ShoppingCartIcon />
      </Badge>
    </Link>
  );
}
