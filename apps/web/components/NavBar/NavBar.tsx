"use client";
import Link from "next/link";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCart from "../ShoppingCart/ShoppingCart";

export default function NavBar() {
  return (
    <nav
      style={{
        minHeight: "48px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        paddingLeft: "24px",
        paddingRight: "24px",
        backgroundColor: "rgb(24, 62, 157)",
      }}
    >
      {/* Left side — links */}
      <Link
        href="/"
        style={{
          color: "rgb(254, 254, 254)",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        Home
      </Link>
      <Link
        href="/Login"
        style={{
          color: "rgb(254, 254, 254)",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        Login
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right side */}
      <ShoppingCart />

      <AccountCircleIcon
        style={{
          color: "rgb(189, 197, 217)",
          fontSize: "28px",
          cursor: "pointer",
        }}
      />

      <Link
        href="/logout"
        style={{
          color: "rgb(189, 197, 217)",
          textDecoration: "none",
          fontWeight: "500",
          fontSize: "0.9rem",
        }}
      >
        Log out
      </Link>
    </nav>
  );
}
