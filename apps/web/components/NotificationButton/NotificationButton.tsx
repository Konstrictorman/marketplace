"use client";
import { useState } from "react";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useNotifications } from "@/context/NotificationContext";
import type { NotificationType } from "@/context/NotificationContext";

const typeIcon = (type: NotificationType) => {
  switch (type) {
    case "purchase":
      return (
        <ShoppingBagOutlinedIcon
          fontSize="small"
          sx={{ color: "rgb(24, 62, 157)" }}
        />
      );
    case "message":
      return (
        <ChatOutlinedIcon fontSize="small" sx={{ color: "rgb(24, 62, 157)" }} />
      );
    case "order":
      return (
        <LocalShippingOutlinedIcon
          fontSize="small"
          sx={{ color: "rgb(24, 62, 157)" }}
        />
      );
    case "review":
      return (
        <StarBorderIcon fontSize="small" sx={{ color: "rgb(24, 62, 157)" }} />
      );
  }
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  return `Hace ${Math.floor(hrs / 24)} d`;
};

export default function NotificationsButton() {
  const { notifications, dismiss, dismissAll } = useNotifications();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  const open = Boolean(anchor);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ color: "rgb(255, 255, 255)" }}
      >
        <Badge
          badgeContent={notifications.length}
          color="error"
          max={99}
          invisible={notifications.length === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxHeight: 440,
              borderRadius: "12px",
              boxShadow: "0px 8px 30px rgba(76, 98, 153, 0.2)",
              mt: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, color: "rgb(0, 28, 100)" }}
          >
            Notificaciones
          </Typography>
          {notifications.length > 0 && (
            <Typography
              variant="body2"
              onClick={dismissAll}
              sx={{
                color: "rgb(131, 148, 189)",
                cursor: "pointer",
                fontSize: "0.75rem",
                "&:hover": { color: "rgb(24, 62, 157)" },
              }}
            >
              Borrar todas
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgb(220, 226, 240)" }} />

        {/* List */}
        {notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "rgb(189, 197, 217)" }}>
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowY: "auto", maxHeight: 360 }}>
            {notifications.map((n, idx) => (
              <Box key={n.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    "&:hover": { bgcolor: "rgba(24, 62, 157, 0.04)" },
                  }}
                >
                  <Box sx={{ mt: 0.3 }}>{typeIcon(n.type)}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgb(0, 28, 100)", lineHeight: 1.5 }}
                    >
                      {n.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgb(131, 148, 189)" }}
                    >
                      {formatTime(n.createdAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => dismiss(n.id)}
                    sx={{ color: "rgb(189, 197, 217)", p: 0.3, mt: 0.2 }}
                  >
                    <CloseIcon sx={{ fontSize: "0.9rem" }} />
                  </IconButton>
                </Box>
                {idx < notifications.length - 1 && (
                  <Divider sx={{ borderColor: "rgb(240, 243, 250)" }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Popover>
    </>
  );
}
