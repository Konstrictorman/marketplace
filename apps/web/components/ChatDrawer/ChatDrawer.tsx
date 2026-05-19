"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { listConversations } from "@/lib/api/conversations";
import { listMessages, createMessage } from "@/lib/api/messages";
import { getProductById } from "@/lib/api/products";
import { getUserById } from "@/lib/api/users";
import { useNotifications } from "@/context/NotificationContext";
import type { Conversation } from "@/lib/api/conversations";
import type { Message } from "@/lib/api/messages";

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  initialConversationId?: string | null;
};

export default function ChatDrawer({
  open,
  onClose,
  userId,
  initialConversationId,
}: ChatDrawerProps) {
  const { addNotification } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [participantNames, setParticipantNames] = useState<
    Record<string, string>
  >({});
  const fetchedProductIds = useRef<Set<string>>(new Set());
  const fetchedParticipantIds = useRef<Set<string>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seenMessageIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  // Fetch conversations when drawer opens
  useEffect(() => {
    if (!open || !userId) return;
    const run = async () => {
      setListLoading(true);
      try {
        const result = await listConversations({ userId, pageSize: 50 });
        setConversations(result.data);

        result.data.forEach((conv) => {
          if (
            conv.productId &&
            !fetchedProductIds.current.has(conv.productId)
          ) {
            fetchedProductIds.current.add(conv.productId);
            getProductById(conv.productId)
              .then((p) =>
                setProductNames((prev) => ({
                  ...prev,
                  [conv.productId!]: p.data.title,
                })),
              )
              .catch(() => {});
          }

          const other = conv.participants.find((p) => p.userId !== userId);
          if (other && !fetchedParticipantIds.current.has(other.userId)) {
            fetchedParticipantIds.current.add(other.userId);
            getUserById(other.userId)
              .then((u) =>
                setParticipantNames((prev) => ({
                  ...prev,
                  [other.userId]: u.name,
                })),
              )
              .catch(() => {});
          }
        });
      } catch {
        // silently fail
      } finally {
        setListLoading(false);
      }
    };
    void run();
  }, [open, userId]);

  // Open directly to a conversation if provided
  useEffect(() => {
    if (!initialConversationId) return;
    const run = async () => {
      setActiveConversationId(initialConversationId);
    };
    void run();
  }, [initialConversationId]);

  // Reset on close
  useEffect(() => {
    if (open) return;
    const run = async () => {
      setActiveConversationId(null);
      setMessages([]);
      setNewMessage("");
    };
    void run();
  }, [open]);

  // Fetch messages + start polling when thread opens
  useEffect(() => {
    if (!activeConversationId || !userId) return;

    // Reset seen-tracking for this conversation
    seenMessageIds.current = new Set();
    initialLoadDone.current = false;

    const fetchMessages = async () => {
      try {
        const result = await listMessages(activeConversationId, {
          sortOrder: "asc",
          pageSize: 100,
        });

        if (!initialLoadDone.current) {
          // First load: mark everything as seen, no notifications
          result.data.forEach((msg) => seenMessageIds.current.add(msg.id));
          initialLoadDone.current = true;
        } else {
          // Subsequent polls: notify for new messages from others
          result.data.forEach((msg) => {
            if (!seenMessageIds.current.has(msg.id)) {
              seenMessageIds.current.add(msg.id);
              if (msg.senderId !== userId) {
                addNotification("Tienes un nuevo mensaje", "message");
              }
            }
          });
        }

        setMessages(result.data);
      } catch {
        // silently fail
      }
    };

    const run = async () => {
      setMessagesLoading(true);
      await fetchMessages();
      setMessagesLoading(false);
    };
    void run();

    pollingRef.current = setInterval(() => void fetchMessages(), 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConversationId, userId, addNotification]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversationId || !userId) return;
    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);
    try {
      const res = await createMessage(activeConversationId, {
        senderId: userId,
        content,
      });
      setMessages((prev) => [...prev, res.data]);
      // Mark own sent message as seen so polling doesn't re-notify
      seenMessageIds.current.add(res.data.id);
    } catch {
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const getTitle = (conv: Conversation) =>
    conv.productId && productNames[conv.productId]
      ? productNames[conv.productId]
      : "Conversación";

  const getOtherParticipant = (conv: Conversation) => {
    const other = conv.participants.find((p) => p.userId !== userId);
    if (!other) return "Usuario";
    return participantNames[other.userId] ?? `ID: ${other.userId.slice(0, 8)}…`;
  };

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {activeConversationId && (
              <IconButton
                size="small"
                onClick={() => setActiveConversationId(null)}
                sx={{ color: "rgb(254, 254, 254)", p: 0.5 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{ color: "rgb(254, 254, 254)", fontWeight: "bold" }}
              noWrap
            >
              {activeConversationId && activeConversation
                ? getTitle(activeConversation)
                : "Chats"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "rgb(254, 254, 254)" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Conversations list */}
        {!activeConversationId && (
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {listLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress
                  size={24}
                  sx={{ color: "rgb(24, 62, 157)" }}
                />
              </Box>
            ) : conversations.length === 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 3,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgb(131, 148, 189)",
                    textAlign: "center",
                    lineHeight: 1.8,
                  }}
                >
                  No tienes conversaciones aún.{"\n"}
                  Contacta a un vendedor desde un producto.
                </Typography>
              </Box>
            ) : (
              conversations.map((conv) => (
                <Box key={conv.id}>
                  <Box
                    onClick={() => setActiveConversationId(conv.id)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(24, 62, 157, 0.05)" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "rgb(0, 28, 100)",
                        mb: 0.3,
                      }}
                      noWrap
                    >
                      {getTitle(conv)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgb(131, 148, 189)" }}
                    >
                      {getOtherParticipant(conv)}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgb(240, 243, 250)" }} />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Message thread */}
        {activeConversationId && (
          <>
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {messagesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress
                    size={24}
                    sx={{ color: "rgb(24, 62, 157)" }}
                  />
                </Box>
              ) : messages.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgb(131, 148, 189)" }}
                  >
                    Inicia la conversación
                  </Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === userId;
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        display: "flex",
                        justifyContent: isOwn ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "75%",
                          px: 1.5,
                          py: 1,
                          borderRadius: isOwn
                            ? "12px 12px 2px 12px"
                            : "12px 12px 12px 2px",
                          bgcolor: isOwn
                            ? "rgb(24, 62, 157)"
                            : "rgb(239, 241, 244)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: isOwn
                              ? "rgb(254, 254, 254)"
                              : "rgb(0, 28, 100)",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.3,
                            fontSize: "0.65rem",
                            color: isOwn
                              ? "rgba(254,254,254,0.6)"
                              : "rgb(131, 148, 189)",
                            textAlign: isOwn ? "right" : "left",
                          }}
                        >
                          {new Date(msg.sentAt).toLocaleTimeString("es-CO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Divider />

            {/* Input */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
              }}
            >
              <InputBase
                fullWidth
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                sx={{
                  flex: 1,
                  fontSize: "0.9rem",
                  bgcolor: "rgb(239, 241, 244)",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.75,
                }}
              />
              <IconButton
                onClick={() => void handleSend()}
                disabled={!newMessage.trim() || sending}
                sx={{
                  color: "rgb(24, 62, 157)",
                  "&:disabled": { color: "rgb(189, 197, 217)" },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
