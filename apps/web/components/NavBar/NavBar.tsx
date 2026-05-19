"use client";
import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import PollIcon from "@mui/icons-material/Poll";
import { Avatar, IconButton, Skeleton } from "@mui/material";
import Link from "next/link";
import ShoppingCart from "../ShoppingCart/ShoppingCart";
import { getAuthSession, logout, type AuthSessionData } from "@/lib/api/auth";
import { hasAdminRole } from "@/lib/route-access";
import NotificationsButton from "../NotificationButton/NotificationButton";
import SearchBar from "../SearchBar/SearchBar";
import ChatButton from "../ChatButton/ChatButton";
import ChatDrawer from "../ChatDrawer/ChatDrawer";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSessionData | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const islogin = pathname === "/login";
  const isshop = pathname === "/shop";
  const isregister = pathname === "/register";
  const ismanage = pathname === "/manage";
  const showProductSearch = isshop || ismanage;
  const showDashboard =
    session?.authenticated === true && hasAdminRole(session.roles);

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

  useEffect(() => {
    const handler = () => setChatOpen(true);
    window.addEventListener("openChatDrawer", handler);
    return () => window.removeEventListener("openChatDrawer", handler);
  }, []);

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
    <>
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
        <IconButton
          component={Link}
          href="/"
          aria-label="Home"
          sx={{ color: "rgb(254, 254, 254)" }}
        >
          <HomeIcon />
        </IconButton>
        {showDashboard && (
          <IconButton
            component={Link}
            href="/dashboard"
            aria-label="Dashboard"
            sx={{ color: "rgb(254, 254, 254)" }}
          >
            <PollIcon />
          </IconButton>
        )}
        {session?.authenticated && !islogin && !isregister && (
          <IconButton
            component={Link}
            href="/orders"
            aria-label="My orders"
            sx={{ color: "rgb(254, 254, 254)" }}
          >
            <ShoppingBasketIcon />
          </IconButton>
        )}
        <Suspense
          fallback={
            <Skeleton
              variant="rounded"
              width={400}
              height={36}
              sx={{
                backgroundColor: "rgba(254, 254, 254, 0.15)",
                borderRadius: "8px",
              }}
            />
          }
        >
          {showProductSearch && <SearchBar />}
        </Suspense>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right side */}
        {isshop && <ShoppingCart />}
        {!islogin && !isregister && <NotificationsButton />}
        {!islogin && !isregister && (
          <ChatButton onClick={() => setChatOpen(true)} />
        )}
        {session?.authenticated && (
          <>
            <Avatar
              aria-label={`Signed in (${session.initials})`}
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.8125rem",
                fontWeight: 600,
                bgcolor: "rgb(189, 197, 217)",
                color: "rgb(24, 62, 157)",
              }}
            >
              {session.initials}
            </Avatar>
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
          </>
        )}
      </nav>

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
