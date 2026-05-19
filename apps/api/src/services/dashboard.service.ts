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
