"use client";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ShoppingCart() {
    const pathname = usePathname();
    const { totalItems } = useCart();

    if (pathname !== "/comprar") return null;

    return (
    <Link href="/cart" style={{ color: 'rgb(254, 254, 254)', display: 'flex', alignItems: 'center' }}>
      <Badge badgeContent={totalItems} color="error">
        <ShoppingCartIcon />
      </Badge>
    </Link>
  );
}