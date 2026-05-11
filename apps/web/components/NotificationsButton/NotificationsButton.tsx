"use client";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { IconButton } from "@mui/material";

export default function NotificationsButton() {
  return (
    <IconButton size="small" sx={{ color: "rgb(255, 255, 255)" }}>
      <NotificationsIcon />
    </IconButton>
  );
}
