import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCustomer, getCustomerOrder } from "@/lib/shopify/customer";

import { Skeleton } from "@/components/ui/skeleton";
import OrderStatusBadge from "@/components/account/order-status-badge";
import Price from "@/components/price";

async function OrderDetail({ id }: { id: string }) {
  const orderId = decodeURIComponent(id);
  const order = await getCustomerOrder(orderId);

  if (!order) {
    // Either not logged in or the order doesn't belong to this customer.
    const customer = await getCustomer();
    if (!customer) {
      redirect("/api/auth/login?return_to=/account/orders");
    }
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Order {order.name}</h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Placed {new Date(order.processedAt).toLocaleDateString()}
          </span>
        </div>
        <OrderStatusBadge status={order.financialStatus} />
      </div>

      <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
        {order.lineItems.nodes.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            {item.image ? (
              <Image
                src={item.image.url}
                alt={item.image.altText ?? item.title}
                width={64}
                height={64}
                className="h-16 w-16 rounded-md border border-neutral-200 object-cover dark:border-neutral-700"
              />
            ) : (
              <div className="h-16 w-16 rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-medium">{item.title}</span>
              {item.variantTitle ? (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {item.variantTitle}
                </span>
              ) : null}
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Qty {item.quantity}
              </span>
            </div>
            {item.totalPrice ? (
              <Price
                className="text-sm font-medium"
                amount={item.totalPrice.amount}
                currencyCode={item.totalPrice.currencyCode}
              />
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex max-w-xs flex-col gap-2 text-sm">
        {order.subtotal ? (
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Subtotal
            </span>
            <Price
              amount={order.subtotal.amount}
              currencyCode={order.subtotal.currencyCode}
            />
          </div>
        ) : null}
        {order.totalShipping ? (
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Shipping
            </span>
            <Price
              amount={order.totalShipping.amount}
              currencyCode={order.totalShipping.currencyCode}
            />
          </div>
        ) : null}
        {order.totalTax ? (
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Tax</span>
            <Price
              amount={order.totalTax.amount}
              currencyCode={order.totalTax.currencyCode}
            />
          </div>
        ) : null}
        {order.totalPrice ? (
          <div className="flex justify-between border-t border-neutral-200 pt-2 font-medium dark:border-neutral-700">
            <span>Total</span>
            <Price
              amount={order.totalPrice.amount}
              currencyCode={order.totalPrice.currencyCode}
            />
          </div>
        ) : null}
      </div>

      {order.shippingAddress ? (
        <div className="flex flex-col gap-1 text-sm">
          <h3 className="font-medium">Shipping address</h3>
          {order.shippingAddress.formatted.map((line) => (
            <p key={line} className="text-neutral-500 dark:text-neutral-400">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {order.statusPageUrl ? (
        <a
          href={order.statusPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline underline-offset-4"
        >
          Track your order
        </a>
      ) : null}

      <Link
        href="/account/orders"
        prefetch={true}
        className="text-sm text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
      >
        Back to orders
      </Link>
    </div>
  );
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <OrderDetail id={id} />
    </Suspense>
  );
}
