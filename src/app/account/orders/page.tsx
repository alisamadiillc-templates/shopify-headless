import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCustomerOrders } from "@/lib/shopify/customer";

import { Skeleton } from "@/components/ui/skeleton";
import OrderStatusBadge from "@/components/account/order-status-badge";
import Price from "@/components/price";

async function Orders() {
  const orders = await getCustomerOrders();

  if (!orders) {
    redirect("/api/auth/login?return_to=/account/orders");
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          You haven't placed any orders yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${encodeURIComponent(order.id)}`}
                prefetch={true}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{order.name}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(order.processedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.financialStatus} />
                  {order.totalPrice ? (
                    <Price
                      className="text-sm font-medium"
                      amount={order.totalPrice.amount}
                      currencyCode={order.totalPrice.currencyCode}
                    />
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      }
    >
      <Orders />
    </Suspense>
  );
}
