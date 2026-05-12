import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProductCard from "@/components/ProductCard/ProductCard";
import { PublishProductButton } from "@/components/PublishProductButton/PublishProductButton";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth-session";
import type { ApiError } from "@/lib/api/client";
import { listCategories } from "@/lib/api/categories";
import { listProducts, type ProductListItem } from "@/lib/api/products";
import { mapProductListItemToCardProduct } from "@/lib/map-product-list-item-to-card";
import {
  decodeMpSessionJwtPayload,
  getUserIdFromMpSessionPayload,
} from "@/lib/mp-session-payload";

export const dynamic = "force-dynamic";

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  const trimmed = s?.trim();
  return trimmed === "" ? undefined : trimmed;
}

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;
  const claims = token ? decodeMpSessionJwtPayload(token) : null;
  const sellerId =
    claims !== null ? getUserIdFromMpSessionPayload(claims) : undefined;

  if (!sellerId) {
    redirect("/login?callbackUrl=/sell");
  }

  const sp = await searchParams;
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

  let publishCategories: { id: string; name: string }[] = [];
  let categoriesError: string | null = null;

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

  try {
    const cat = await listCategories({
      page: 1,
      pageSize: 100,
      isActive: true,
    });
    publishCategories = cat.data.map(({ id, name }) => ({ id, name }));
  } catch (e: unknown) {
    const apiErr = e as Partial<ApiError>;
    categoriesError =
      typeof apiErr?.message === "string"
        ? apiErr.message
        : "Could not load categories.";
  }

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (p !== 1) {
      params.set("page", String(p));
    }
    const q = params.toString();
    return q === "" ? "/sell" : `/sell?${q}`;
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
        <div className="flex shrink-0 flex-col items-end gap-1">
          {categoriesError ? (
            <p
              className="max-w-xs text-right text-xs text-amber-700 dark:text-amber-300"
              role="status"
            >
              {categoriesError} — no se puede publicar hasta que existan
              categorías.
            </p>
          ) : null}
          <PublishProductButton
            sellerId={sellerId}
            categories={publishCategories}
          />
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
