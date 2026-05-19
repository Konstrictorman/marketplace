"use client";
import ChatIcon from "@mui/icons-material/Chat";
import { Badge, IconButton, Button } from "@mui/material";

type ChatButtonProps = {
  onClick: () => void;
  variant?: "navbar" | "modal";
  unreadCount?: number;
};

export default function ChatButton({
  onClick,
  variant = "navbar",
  unreadCount = 0,
}: ChatButtonProps) {
  if (variant === "modal") {
    return (
      <Button
        variant="outlined"
        fullWidth
        startIcon={<ChatIcon />}
        onClick={onClick}
        sx={{
          textTransform: "none",
          borderRadius: "10px",
          py: 1.2,
          borderColor: "rgb(24,62,157)",
          color: "rgb(24,62,157)",
          "&:hover": {
            borderColor: "rgb(29, 54, 120)",
            backgroundColor: "rgba(24, 62, 157, 0.05)",
          },
        }}
      >
        Chat with seller
      </Button>
    );
  }
  return (
    <IconButton
      size="small"
      onClick={onClick}
      sx={{ color: "rgb(255, 255, 255)" }}
    >
      <Badge badgeContent={unreadCount} color="error">
        <ChatIcon />
      </Badge>
    </IconButton>
  );
}
