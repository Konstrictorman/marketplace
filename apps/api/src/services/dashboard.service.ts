import { OrderStatus, prisma } from "@marketplace/database";

export type CategorySalesSliceDTO = {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
};

const SOLD_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.confirmed,
  OrderStatus.delivered,
];

/** Units sold per category from completed purchases (`order_items` on non-cancelled orders). */
export async function getSalesByCategory(): Promise<CategorySalesSliceDTO[]> {
  const lineItems = await prisma.orderItem.findMany({
    where: {
      order: { status: { in: SOLD_ORDER_STATUSES } },
    },
    select: {
      quantity: true,
      product: {
        select: {
          category: { select: { id: true, name: true } },
        },
      },
    },
  });

  const totals = new Map<
    string,
    { categoryId: string; categoryName: string; quantitySold: number }
  >();

  for (const line of lineItems) {
    const { category } = line.product;
    const current = totals.get(category.id) ?? {
      categoryId: category.id,
      categoryName: category.name,
      quantitySold: 0,
    };
    current.quantitySold += line.quantity;
    totals.set(category.id, current);
  }

  return [...totals.values()]
    .filter((row) => row.quantitySold > 0)
    .sort(
      (a, b) =>
        b.quantitySold - a.quantitySold ||
        a.categoryName.localeCompare(b.categoryName),
    );
}

export type ProductsPublishedPointDTO = {
  /** ISO date `YYYY-MM-DD` (UTC). */
  date: string;
  count: number;
};

const PUBLISHED_LOOKBACK_DAYS = 30;

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Daily product publish counts for the last 30 days (inclusive). */
export async function getProductsPublishedLastMonth(): Promise<
  ProductsPublishedPointDTO[]
> {
  const today = startOfUtcDay(new Date());
  const since = new Date(today);
  since.setUTCDate(since.getUTCDate() - (PUBLISHED_LOOKBACK_DAYS - 1));

  const products = await prisma.product.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const countsByDate = new Map<string, number>();
  for (let i = 0; i < PUBLISHED_LOOKBACK_DAYS; i += 1) {
    const day = new Date(since);
    day.setUTCDate(since.getUTCDate() + i);
    countsByDate.set(utcDateKey(day), 0);
  }

  for (const product of products) {
    const key = utcDateKey(product.createdAt);
    if (countsByDate.has(key)) {
      countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
    }
  }

  return [...countsByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
