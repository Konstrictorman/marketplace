"use client";
import ChatIcon from "@mui/icons-material/Chat";
import { IconButton } from "@mui/material";

export default function ChatButton() {
  return (
    <IconButton size="small" sx={{ color: "rgb(255, 255, 255)" }}>
      <ChatIcon />
    </IconButton>
  );
}
