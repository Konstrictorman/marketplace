"use client";
import Link from "next/link";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCart from "../ShoppingCart/ShoppingCart";
import NotificationsButton from "../NotificationsIcon/NotificationsIcon";
import SearchBar from "../SearchBar/SearchBar";
import ChatButton from "../ChatIcon/ChatIcon";
import { Suspense } from "react";

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
        href="/login"
        style={{
          color: "rgb(254, 254, 254)",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        Login
      </Link>

      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right side */}
      <ShoppingCart />
      <NotificationsButton />
      <ChatButton />

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
