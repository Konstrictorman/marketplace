"use client";
import { Drawer, Box, Typography, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 360,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            backgroundColor: "rgb(24, 62, 157)",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "rgb(254, 254, 254)", fontWeight: "bold" }}
          >
            Chats
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "rgb(254, 254, 254)" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Placeholder */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "rgb(131, 148, 189)" }}>
            No conversations yet
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
