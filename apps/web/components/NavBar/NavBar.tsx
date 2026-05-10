"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCart from "../ShoppingCart/ShoppingCart";
import { logout } from "@/lib/api/auth";

export default function NavBar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }
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
        href="/login"
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

      <button
        type="button"
        onClick={() => void handleLogout()}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "rgb(189, 197, 217)",
          textDecoration: "none",
          fontWeight: "500",
          fontSize: "0.9rem",
          fontFamily: "inherit",
        }}
      >
        Log out
      </button>
    </nav>
  );
}
