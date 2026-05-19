"use client";
import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Skeleton } from "@mui/material";
import ShoppingCart from "../ShoppingCart/ShoppingCart";
import { getAuthSession, logout, type AuthSessionData } from "@/lib/api/auth";
import NotificationsButton from "../NotificationButton/NotificationButton";
import SearchBar from "../SearchBar/SearchBar";
import ChatButton from "../ChatButton/ChatButton";
import ChatDrawer from "../ChatDrawer/ChatDrawer";
import { useNotifications } from "@/context/NotificationContext";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { notifications, dismiss } = useNotifications();
  const [session, setSession] = useState<AuthSessionData | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(
    null,
  );
  const islogin = pathname === "/login";
  const isshop = pathname === "/shop";
  const isregister = pathname === "/register";

  const unreadMessageCount = notifications.filter(
    (n) => n.type === "message",
  ).length;

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
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ conversationId?: string }>).detail;
      setChatConversationId(detail?.conversationId ?? null);
      setChatOpen(true);
    };
    window.addEventListener("openChatDrawer", handler);
    return () => window.removeEventListener("openChatDrawer", handler);
  }, []);

  // Dismiss message notifications when chat opens
  useEffect(() => {
    if (!chatOpen) return;
    const run = async () => {
      notifications
        .filter((n) => n.type === "message")
        .forEach((n) => dismiss(n.id));
    };
    void run();
  }, [chatOpen, notifications, dismiss]);

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
        <Button
          href="/"
          style={{
            color: "rgb(254, 254, 254)",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Home
        </Button>
        {session?.authenticated && !islogin && !isregister && (
          <Button
            href="/orders"
            style={{
              color: "rgb(254, 254, 254)",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Mis Pedidos
          </Button>
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
          {isshop && <SearchBar />}
        </Suspense>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right side */}
        {isshop && <ShoppingCart />}
        {!islogin && !isregister && <NotificationsButton />}
        {!islogin && !isregister && (
          <ChatButton
            onClick={() => setChatOpen(true)}
            unreadCount={unreadMessageCount}
          />
        )}
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
        {session?.authenticated && !islogin && !isregister && (
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
        )}
      </nav>

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        userId={session?.authenticated ? session.userId : null}
        initialConversationId={chatConversationId}
      />
    </>
  );
}
