import Link from "next/link";
import ProductCard from "@/components/ProductCard/ProductCard";
import { PublishProductButton } from "@/components/VenderPublishProduct/PublishProductButton";
import type { ApiError } from "@/lib/api/client";
import { listProducts, type ProductListItem } from "@/lib/api/products";
import { mapProductListItemToCardProduct } from "@/lib/map-product-list-item-to-card";

export const dynamic = "force-dynamic";

/** Stand-in until auth provides the logged-in user id. Replace with session user. */
const DEV_FALLBACK_SELLER_ID = "8ff50906-7d8b-41d7-ad51-198f912a4e46";

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  const trimmed = s?.trim();
  return trimmed === "" ? undefined : trimmed;
}

function statusChipClass(status: ProductListItem["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-900";
    case "inactive":
      return "bg-zinc-200 text-zinc-800";
    case "removed":
      return "bg-red-100 text-red-900";
    default:
      return "bg-zinc-100 text-zinc-800";
  }
}

export default async function VenderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sellerIdFromQuery = firstSearchParam(sp.sellerId);
  const sellerId = sellerIdFromQuery || DEV_FALLBACK_SELLER_ID;
  const page = Math.max(
    1,
    Number.parseInt(firstSearchParam(sp.page) ?? "1", 10) || 1,
  );
  const pageSize = 12;

  let products: ProductListItem[] = [];
  let meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null = null;
  let fetchError: string | null = null;

  try {
    const result = await listProducts({
      sellerId,
      page,
      pageSize,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    products = result.data;
    meta = result.meta;
  } catch (e: unknown) {
    const apiErr = e as Partial<ApiError>;
    fetchError =
      typeof apiErr?.message === "string"
        ? apiErr.message
        : "Could not load products.";
  }

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (sellerIdFromQuery) {
      params.set("sellerId", sellerIdFromQuery);
    }
    if (p !== 1) {
      params.set("page", String(p));
    }
    const q = params.toString();
    return q === "" ? "/vender" : `/vender?${q}`;
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
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <PublishProductButton sellerId={sellerId} />
          {sellerIdFromQuery ? (
            <Link
              href="/vender"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Reset to dev default
            </Link>
          ) : null}
        </div>
      </header>

      {fetchError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {fetchError}
        </div>
      )}

      {!fetchError && products.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-400">
          No tienes productos publicados.
        </p>
      )}

      {!fetchError && products.length > 0 && (
        <>
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex w-[280px] flex-col items-center gap-2"
              >
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusChipClass(p.status)}`}
                >
                  {p.status}
                </span>
                <ProductCard product={mapProductListItemToCardProduct(p)} />
              </li>
            ))}
          </ul>

          {meta && meta.totalPages > 1 && (
            <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-700">
              <p className="text-zinc-600 dark:text-zinc-400">
                Page {meta.page} of {meta.totalPages}
                <span className="text-zinc-400 dark:text-zinc-500">
                  {" "}
                  ({meta.total} total)
                </span>
              </p>
              <div className="flex gap-2">
                <Link
                  href={buildHref(Math.max(1, meta.page - 1))}
                  aria-disabled={meta.page <= 1}
                  className={`rounded-lg border px-3 py-2 font-medium ${
                    meta.page <= 1
                      ? "pointer-events-none border-zinc-200 text-zinc-400 dark:border-zinc-800"
                      : "border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={buildHref(Math.min(meta.totalPages, meta.page + 1))}
                  aria-disabled={meta.page >= meta.totalPages}
                  className={`rounded-lg border px-3 py-2 font-medium ${
                    meta.page >= meta.totalPages
                      ? "pointer-events-none border-zinc-200 text-zinc-400 dark:border-zinc-800"
                      : "border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Next
                </Link>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
