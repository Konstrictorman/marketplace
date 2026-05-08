import {
  OrderStatus,
  Prisma,
  ProductStatus,
  prisma,
} from "@marketplace/database";
import { HttpError } from "../lib/http-errors.js";

export type OrderItemDTO = {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  createdAt: string;
};

export type OrderSummaryDTO = {
  id: string;
  buyerId: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetailDTO = OrderSummaryDTO & { items: OrderItemDTO[] };

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

type OrderItemRow = OrderWithItems["items"][number];

function mapOrderItem(row: OrderItemDTO | OrderItemRow): OrderItemDTO {
  const unitPrice =
    row.unitPrice instanceof Prisma.Decimal
      ? row.unitPrice.toString()
      : row.unitPrice;
  const subtotal =
    row.subtotal instanceof Prisma.Decimal
      ? row.subtotal.toString()
      : row.subtotal;
  const createdAt =
    row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt;
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    sellerId: row.sellerId,
    quantity: row.quantity,
    unitPrice,
    subtotal,
    createdAt,
  };
}

export function mapOrderSummary(order: {
  id: string;
  buyerId: string;
  status: OrderStatus;
  total: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
}): OrderSummaryDTO {
  return {
    id: order.id,
    buyerId: order.buyerId,
    status: order.status,
    totalAmount: order.total.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function mapOrderDetail(order: OrderWithItems): OrderDetailDTO {
  return {
    ...mapOrderSummary(order),
    items: order.items.map((item) => mapOrderItem(item)),
  };
}

async function ensureBuyerExists(
  tx: Prisma.TransactionClient,
  buyerId: string,
): Promise<void> {
  const user = await tx.user.findUnique({
    where: { id: buyerId },
    select: { id: true },
  });
  if (!user) {
    throw new HttpError(404, "Buyer not found", "buyer_not_found");
  }
}

type OrderReadClient = Pick<typeof prisma, "order">;

async function loadOrderOwned(
  tx: OrderReadClient,
  orderId: string,
  buyerId: string | undefined,
): Promise<OrderWithItems> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) {
    throw new HttpError(404, "Order not found", "order_not_found");
  }
  if (buyerId !== undefined && order.buyerId !== buyerId) {
    throw new HttpError(403, "You do not own this order", "forbidden");
  }
  return order;
}

function ensureProductEligible(
  product: { id: string; status: ProductStatus } | undefined,
): asserts product is {
  id: string;
  status: ProductStatus;
  sellerId: string;
  price: Prisma.Decimal;
  inventory: number;
} {
  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }
  if (product.status === ProductStatus.removed) {
    throw new HttpError(409, "Product is no longer listed", "product_removed");
  }
  if (product.status === ProductStatus.inactive) {
    throw new HttpError(
      409,
      "Product is not available for purchase",
      "product_not_available",
    );
  }
}

async function decrementInventory(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
): Promise<void> {
  const result = await tx.product.updateMany({
    where: { id: productId, inventory: { gte: quantity } },
    data: { inventory: { decrement: quantity } },
  });
  if (result.count !== 1) {
    throw new HttpError(
      409,
      "Insufficient inventory for this product",
      "insufficient_inventory",
    );
  }
}

async function incrementInventory(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
): Promise<void> {
  await tx.product.update({
    where: { id: productId },
    data: { inventory: { increment: quantity } },
  });
}

async function recomputeOrderTotal(
  tx: Prisma.TransactionClient,
  orderId: string,
): Promise<Prisma.Decimal> {
  const agg = await tx.orderItem.aggregate({
    where: { orderId },
    _sum: { subtotal: true },
  });
  const total =
    agg._sum.subtotal === null || agg._sum.subtotal === undefined
      ? new Prisma.Decimal(0)
      : agg._sum.subtotal;
  await tx.order.update({
    where: { id: orderId },
    data: { total },
  });
  return total;
}

async function restoreOrderItemsToInventory(
  tx: Prisma.TransactionClient,
  items: Pick<OrderItemRow, "productId" | "quantity">[],
): Promise<void> {
  for (const line of items) {
    await incrementInventory(tx, line.productId, line.quantity);
  }
}

export async function createOrder(input: {
  buyerId: string;
  items: { productId: string; quantity: number }[];
}): Promise<{ data: OrderDetailDTO }> {
  return prisma.$transaction(async (tx) => {
    await ensureBuyerExists(tx, input.buyerId);

    const productIds = [...new Set(input.items.map((i) => i.productId))];
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    type Line = {
      productId: string;
      quantity: number;
      sellerId: string;
      unitPrice: Prisma.Decimal;
      subtotal: Prisma.Decimal;
    };

    const invNeeded = new Map<string, number>();
    for (const item of input.items) {
      invNeeded.set(
        item.productId,
        (invNeeded.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const lines: Line[] = [];
    for (const [productId, quantity] of invNeeded) {
      const p = byId.get(productId);
      ensureProductEligible(p);
      lines.push({
        productId,
        quantity,
        sellerId: p!.sellerId,
        unitPrice: p!.price,
        subtotal: new Prisma.Decimal(p!.price).mul(quantity),
      });
    }

    for (const [pid, need] of invNeeded) {
      const p = byId.get(pid)!;
      if (p.inventory < need) {
        throw new HttpError(
          409,
          "Insufficient inventory for this product",
          "insufficient_inventory",
        );
      }
    }

    const total = lines.reduce(
      (acc, l) => acc.add(l.subtotal),
      new Prisma.Decimal(0),
    );

    const order = await tx.order.create({
      data: {
        buyerId: input.buyerId,
        status: OrderStatus.pending,
        total,
      },
    });

    for (const line of lines) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: line.productId,
          sellerId: line.sellerId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          subtotal: line.subtotal,
        },
      });
    }

    for (const [pid, need] of invNeeded) {
      await decrementInventory(tx, pid, need);
    }

    const full = await tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
    return { data: mapOrderDetail(full) };
  });
}

export type ListOrdersParams = {
  buyerId?: string | undefined;
  page: number;
  pageSize: number;
  status?: OrderStatus | undefined;
};

export async function listOrders(params: ListOrdersParams) {
  const where: Prisma.OrderWhereInput = {};
  if (params.buyerId !== undefined) {
    where.buyerId = params.buyerId;
  }
  if (params.status !== undefined) {
    where.status = params.status;
  }

  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages =
    params.pageSize === 0 ? 0 : Math.ceil(total / params.pageSize);

  return {
    data: rows.map((row) => mapOrderSummary(row)),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
    },
  };
}

export async function getOrderById(
  orderId: string,
  buyerId?: string | undefined,
): Promise<{ data: OrderDetailDTO }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) {
    throw new HttpError(404, "Order not found", "order_not_found");
  }
  if (buyerId !== undefined && order.buyerId !== buyerId) {
    throw new HttpError(403, "You do not own this order", "forbidden");
  }
  return { data: mapOrderDetail(order) };
}

export async function patchOrder(
  orderId: string,
  buyerId: string | undefined,
  status: OrderStatus,
): Promise<{ data: OrderDetailDTO }> {
  return prisma.$transaction(async (tx) => {
    const order = await loadOrderOwned(tx, orderId, buyerId);

    if (status === OrderStatus.cancelled) {
      if (order.status === OrderStatus.cancelled) {
        /** idempotent cancel */
      } else if (order.status !== OrderStatus.pending) {
        throw new HttpError(
          409,
          "Order can only be cancelled while pending",
          "cancelled_only_from_pending",
        );
      } else {
        await restoreOrderItemsToInventory(tx, order.items);
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.cancelled },
        });
      }
    } else if (status === order.status) {
      /** no-op acceptable */
    } else {
      throw new HttpError(
        409,
        "This status change is not allowed",
        "invalid_order_transition",
      );
    }

    const full = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
    return { data: mapOrderDetail(full) };
  });
}

export async function deleteOrder(
  orderId: string,
  buyerId?: string | undefined,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await loadOrderOwned(tx, orderId, buyerId);
    if (order.status !== OrderStatus.pending) {
      throw new HttpError(
        409,
        "Only pending orders can be deleted",
        "order_not_pending",
      );
    }
    await restoreOrderItemsToInventory(tx, order.items);
    await tx.order.delete({ where: { id: orderId } });
  });
}

export async function listOrderItems(
  orderId: string,
  buyerId?: string | undefined,
): Promise<{ data: OrderItemDTO[] }> {
  const order = await loadOrderOwned(prisma, orderId, buyerId);
  return { data: order.items.map((item) => mapOrderItem(item)) };
}

export async function getOrderItem(
  orderId: string,
  itemId: string,
  buyerId?: string | undefined,
): Promise<{ data: OrderItemDTO }> {
  const order = await loadOrderOwned(prisma, orderId, buyerId);
  const item = order.items.find((i) => i.id === itemId);
  if (!item) {
    throw new HttpError(404, "Order item not found", "order_item_not_found");
  }
  return { data: mapOrderItem(item) };
}

export async function addOrderItem(input: {
  orderId: string;
  buyerId?: string | undefined;
  productId: string;
  quantity: number;
}): Promise<{ data: OrderDetailDTO }> {
  return prisma.$transaction(async (tx) => {
    const order = await loadOrderOwned(tx, input.orderId, input.buyerId);
    if (order.status !== OrderStatus.pending) {
      throw new HttpError(
        409,
        "Order line items cannot be modified after checkout",
        "order_not_pending",
      );
    }

    const product = await tx.product.findUnique({
      where: { id: input.productId },
    });
    ensureProductEligible(product ?? undefined);

    await decrementInventory(tx, input.productId, input.quantity);

    const existing = await tx.orderItem.findFirst({
      where: { orderId: input.orderId, productId: input.productId },
    });

    if (existing) {
      const newQty = existing.quantity + input.quantity;
      const newSubtotal = new Prisma.Decimal(existing.unitPrice).mul(newQty);
      await tx.orderItem.update({
        where: { id: existing.id },
        data: { quantity: newQty, subtotal: newSubtotal },
      });
    } else {
      const unitPrice = product!.price;
      const subtotal = new Prisma.Decimal(unitPrice).mul(input.quantity);
      await tx.orderItem.create({
        data: {
          orderId: input.orderId,
          productId: input.productId,
          sellerId: product!.sellerId,
          quantity: input.quantity,
          unitPrice,
          subtotal,
        },
      });
    }

    await recomputeOrderTotal(tx, input.orderId);

    const full = await tx.order.findUniqueOrThrow({
      where: { id: input.orderId },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
    return { data: mapOrderDetail(full) };
  });
}

export async function patchOrderItem(input: {
  orderId: string;
  itemId: string;
  buyerId?: string | undefined;
  quantity: number;
}): Promise<{ data: OrderDetailDTO }> {
  return prisma.$transaction(async (tx) => {
    const order = await loadOrderOwned(tx, input.orderId, input.buyerId);
    if (order.status !== OrderStatus.pending) {
      throw new HttpError(
        409,
        "Order line items cannot be modified after checkout",
        "order_not_pending",
      );
    }

    const item = await tx.orderItem.findFirst({
      where: { id: input.itemId, orderId: input.orderId },
    });
    if (!item) {
      throw new HttpError(404, "Order item not found", "order_item_not_found");
    }

    const delta = input.quantity - item.quantity;
    if (delta === 0) {
      const full = await tx.order.findUniqueOrThrow({
        where: { id: input.orderId },
        include: { items: { orderBy: { createdAt: "asc" } } },
      });
      return { data: mapOrderDetail(full) };
    }

    if (delta > 0) {
      await decrementInventory(tx, item.productId, delta);
    } else {
      await incrementInventory(tx, item.productId, -delta);
    }

    const subtotal = new Prisma.Decimal(item.unitPrice).mul(input.quantity);

    await tx.orderItem.update({
      where: { id: input.itemId },
      data: { quantity: input.quantity, subtotal },
    });

    await recomputeOrderTotal(tx, input.orderId);

    const full = await tx.order.findUniqueOrThrow({
      where: { id: input.orderId },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
    return { data: mapOrderDetail(full) };
  });
}

export async function deleteOrderItem(input: {
  orderId: string;
  itemId: string;
  buyerId?: string | undefined;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await loadOrderOwned(tx, input.orderId, input.buyerId);
    if (order.status !== OrderStatus.pending) {
      throw new HttpError(
        409,
        "Order line items cannot be modified after checkout",
        "order_not_pending",
      );
    }

    const item = await tx.orderItem.findFirst({
      where: { id: input.itemId, orderId: input.orderId },
    });
    if (!item) {
      throw new HttpError(404, "Order item not found", "order_item_not_found");
    }

    await incrementInventory(tx, item.productId, item.quantity);
    await tx.orderItem.delete({ where: { id: input.itemId } });
    await recomputeOrderTotal(tx, input.orderId);
  });
}
