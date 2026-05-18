"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { getAuthSession } from "@/lib/api/auth";
import { listOrders, getOrderById } from "@/lib/api/orders";
import { getProductById } from "@/lib/api/products";
import type { OrderSummary, OrderDetail } from "@/lib/api/orders";

const statusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "success";
    case "delivered":
      return "success";
    case "shipped":
      return "info";
    case "cancelled":
      return "error";
    default:
      return "warning";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "paid":
      return "Pagado";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<string, OrderDetail>>(
    {},
  );
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [expandLoading, setExpandLoading] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);

  const pageSize = 10;

  useEffect(() => {
    const init = async () => {
      const session = await getAuthSession();
      if (!session.authenticated) {
        router.push("/login?callbackUrl=/orders");
        return;
      }
      setBuyerId(session.userId);
    };
    void init();
  }, [router]);

  useEffect(() => {
    if (!buyerId) return;
    const run = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await listOrders({ buyerId, page, pageSize });
        setOrders(result.data);
        setTotalPages(result.meta.totalPages);
      } catch {
        setFetchError("No se pudieron cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [buyerId, page]);

  const handleExpand = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    if (orderDetails[orderId]) return;

    setExpandLoading(true);
    setExpandError(null);
    try {
      const detail = await getOrderById(orderId, {
        buyerId: buyerId ?? undefined,
      });
      setOrderDetails((prev) => ({ ...prev, [orderId]: detail.data }));

      const unknownIds = detail.data.items
        .map((i) => i.productId)
        .filter((id) => !productNames[id]);

      await Promise.allSettled(
        unknownIds.map(async (productId) => {
          try {
            const p = await getProductById(productId);
            setProductNames((prev) => ({ ...prev, [productId]: p.data.title }));
          } catch {
            setProductNames((prev) => ({ ...prev, [productId]: productId }));
          }
        }),
      );
    } catch {
      setExpandError("No se pudo cargar el detalle de este pedido.");
      setExpandedOrderId(null);
    } finally {
      setExpandLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="border-b border-zinc-200 pb-6 dark:border-zinc-700">
        <h1 className="text-2xl font-bold text-[rgb(0,28,100)]">Mis Pedidos</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Historial de todas tus compras.
        </p>
      </header>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "rgb(24, 62, 157)" }} />
        </Box>
      )}

      {!loading && fetchError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {fetchError}
        </div>
      )}

      {!loading && !fetchError && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center">
          <p className="text-sm text-zinc-600">No tienes pedidos aún.</p>
          <Link
            href="/shop"
            className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline"
          >
            Ir a la tienda →
          </Link>
        </div>
      )}

      {!loading && !fetchError && orders.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const detail = orderDetails[order.id];

            return (
              <Card
                key={order.id}
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0px 2px 10px rgba(76, 98, 153, 0.15)",
                  overflow: "hidden",
                }}
              >
                {/* Summary row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 3,
                    py: 2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(24,62,157,0.03)" },
                  }}
                  onClick={() => void handleExpand(order.id)}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgb(131, 148, 189)", fontSize: "0.75rem" }}
                    >
                      Pedido
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "rgb(0, 28, 100)",
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.id}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ color: "rgb(76, 98, 153)", whiteSpace: "nowrap" }}
                  >
                    {new Date(order.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>

                  <Chip
                    label={statusLabel(order.status)}
                    color={
                      statusColor(order.status) as
                        | "success"
                        | "error"
                        | "warning"
                        | "info"
                    }
                    size="small"
                    sx={{ textTransform: "capitalize", fontWeight: 600 }}
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: "rgb(29, 54, 120)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${Number(order.totalAmount).toLocaleString("es-CO")}
                  </Typography>

                  <IconButton
                    size="small"
                    sx={{
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      color: "rgb(131, 148, 189)",
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Expanded items */}
                <Collapse in={isExpanded}>
                  <Divider sx={{ borderColor: "rgb(220, 226, 240)" }} />
                  <Box sx={{ px: 3, py: 2 }}>
                    {expandLoading && !detail ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 2,
                        }}
                      >
                        <CircularProgress
                          size={20}
                          sx={{ color: "rgb(24, 62, 157)" }}
                        />
                      </Box>
                    ) : detail ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {detail.items.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "rgb(0, 28, 100)",
                                }}
                              >
                                {productNames[item.productId] ?? "Cargando…"}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "rgb(131, 148, 189)",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Cantidad: {item.quantity} · Precio unitario: $
                                {Number(item.unitPrice).toLocaleString("es-CO")}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "rgb(29, 54, 120)",
                              }}
                            >
                              ${Number(item.subtotal).toLocaleString("es-CO")}
                            </Typography>
                          </Box>
                        ))}

                        <Divider
                          sx={{ borderColor: "rgb(220, 226, 240)", mt: 1 }}
                        />
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 700, color: "rgb(0, 28, 100)" }}
                          >
                            Total: $
                            {Number(order.totalAmount).toLocaleString("es-CO")}
                          </Typography>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-sm">
          <p className="text-zinc-600">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`rounded-lg border px-3 py-2 font-medium ${
                page <= 1
                  ? "pointer-events-none border-zinc-200 text-zinc-400"
                  : "border-zinc-300 text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`rounded-lg border px-3 py-2 font-medium ${
                page >= totalPages
                  ? "pointer-events-none border-zinc-200 text-zinc-400"
                  : "border-zinc-300 text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              Siguiente
            </button>
          </div>
        </nav>
      )}

      <Snackbar
        open={Boolean(expandError)}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setExpandError(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setExpandError(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {expandError}
        </Alert>
      </Snackbar>
    </div>
  );
}
