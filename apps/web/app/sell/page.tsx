"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  PublishProductButton,
  PublishProductFormModal,
} from "@/components/PublishProductButton/PublishProductButton";
import type { ApiError } from "@/lib/api/client";
import { isApiError } from "@/lib/api/client";
import {
  listProducts,
  deleteProduct,
  getProductById,
} from "@/lib/api/products";
import type { Product } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { mapProductListItemToCardProduct } from "@/lib/map-product-list-item-to-card";
import { getAuthSession } from "@/lib/api/auth";
import ProductCard from "@/components/ProductCard/ProductCard";
import type { productType } from "@/types/types";

export default function SellPage() {
  const router = useRouter();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [products, setProducts] = useState<productType[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<productType | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const pageSize = 12;

  useEffect(() => {
    const init = async () => {
      const session = await getAuthSession();
      if (!session.authenticated) {
        router.push("/login?callbackUrl=/sell");
        return;
      }
      setSellerId(session.userId);
    };
    void init();
  }, [router]);

  const fetchProducts = async (
    currentSellerId: string,
    currentPage: number,
  ) => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await listProducts({
        sellerId: currentSellerId,
        page: currentPage,
        pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setProducts(
        result.data
          .filter((p) => p.status !== "removed")
          .map(mapProductListItemToCardProduct),
      );
      setTotalPages(result.meta.totalPages);
      setTotal(result.meta.total);
    } catch (e: unknown) {
      const apiErr = e as Partial<ApiError>;
      setFetchError(
        typeof apiErr?.message === "string"
          ? apiErr.message
          : "Could not load products.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sellerId) return;
    const run = async () => {
      await fetchProducts(sellerId, page);
    };
    void run();
  }, [sellerId, page]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cat = await listCategories({
          page: 1,
          pageSize: 100,
          isActive: true,
        });
        setCategories(cat.data.map(({ id, name }) => ({ id, name })));
      } catch {
        // silently fail
      }
    };
    void fetchCategories();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete || !sellerId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(productToDelete.id, { sellerId });
      setProductToDelete(null);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setSuccessToast("Producto eliminado exitosamente");
    } catch (e) {
      const message = isApiError(e)
        ? e.message
        : "Could not delete product. Please try again.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (product: productType) => {
    try {
      const full = await getProductById(product.id);
      setProductToEdit(full.data);
    } catch {
      // silently fail — product stays uneditable
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-700 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos publicados</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Acá puedes ver los productos que has publicado.
          </p>
        </div>
        {sellerId && (
          <PublishProductButton
            sellerId={sellerId}
            categories={categories}
            onSuccess={() => void fetchProducts(sellerId, page)}
          />
        )}
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

      {!loading && !fetchError && products.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
          No tienes productos publicados.
        </p>
      )}

      {!loading && !fetchError && products.length > 0 && (
        <>
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex w-[280px] flex-col items-center gap-2"
              >
                <ProductCard
                  product={p}
                  isOwner
                  onEdit={() => void handleEdit(p)}
                  onDelete={() => setProductToDelete(p)}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-sm">
              <p className="text-zinc-600">
                Page {page} of {totalPages}
                <span className="text-zinc-400"> ({total} total)</span>
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
                  Previous
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
                  Next
                </button>
              </div>
            </nav>
          )}
        </>
      )}

      {/* Edit modal */}
      {sellerId && productToEdit && (
        <PublishProductFormModal
          open={Boolean(productToEdit)}
          onClose={() => setProductToEdit(null)}
          sellerId={sellerId}
          categories={categories}
          initialProduct={productToEdit}
          onSuccess={() => {
            setProductToEdit(null);
            void fetchProducts(sellerId, page);
            setSuccessToast("Producto actualizado exitosamente");
          }}
        />
      )}

      {/* Delete dialog */}
      <Dialog open={!!productToDelete} onClose={() => setProductToDelete(null)}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{productToDelete?.name}</strong>? This action cannot be
            undone.
          </DialogContentText>
          {deleteError && (
            <Typography variant="body2" sx={{ color: "error.main", mt: 1 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setProductToDelete(null)}
            disabled={isDeleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{ textTransform: "none", color: "red" }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(successToast)}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSuccessToast(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessToast(null)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successToast}
        </Alert>
      </Snackbar>
    </div>
  );
}
