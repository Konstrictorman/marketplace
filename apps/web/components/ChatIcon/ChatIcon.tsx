"use client";
import { usePathname } from "next/navigation";
import ChatIcon from "@mui/icons-material/Chat";
import { IconButton } from "@mui/material";

export default function ChatButton() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <IconButton size="small" sx={{ color: "rgb(189, 197, 217)" }}>
      <ChatIcon />
    </IconButton>
  );
}
