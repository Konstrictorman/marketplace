"use client";
import { usePathname } from "next/navigation";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { IconButton } from "@mui/material";

export default function NotificationsButton() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <IconButton size="small" sx={{ color: "rgb(189, 197, 217)" }}>
      <NotificationsIcon />
    </IconButton>
  );
}
