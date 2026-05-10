"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@mui/material";
import ShoppingCart from "../ShoppingCart/ShoppingCart";
import { getAuthSession, logout, type AuthSessionData } from "@/lib/api/auth";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSessionData | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAuthSession()
      .then((s) => {
        if (!cancelled) setSession(s);
      })
      .catch(() => {
        if (!cancelled) setSession({ authenticated: false });
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setSession({ authenticated: false });
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

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right side */}
      <ShoppingCart />
      {session?.authenticated && (
        <Avatar
          aria-label={
            session?.authenticated
              ? `Signed in (${session.initials})`
              : "Not signed in"
          }
          sx={{
            width: 32,
            height: 32,
            fontSize: "0.8125rem",
            fontWeight: 600,
            bgcolor: "rgb(189, 197, 217)",
            color: "rgb(24, 62, 157)",
          }}
        >
          {session?.authenticated ? session.initials : "?"}
        </Avatar>
      )}
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
