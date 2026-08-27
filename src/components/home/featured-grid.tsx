import Image from "next/image";
import Link from "next/link";

import { getCollectionProducts } from "@/lib/shopify";
import { Product } from "@/lib/shopify/types";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

import Price from "@/components/price";

const { featured } = siteConfig;

function FeaturedTile({
  product,
  large,
  className,
}: {
  product: Product;
  large?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/product/${product.handle}`}
      prefetch={true}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800",
          large ? "aspect-[4/3] md:h-full md:flex-1" : "aspect-[4/3]"
        )}
      >
        {product.featuredImage?.url ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes={
              large
                ? "(min-width: 768px) 66vw, 100vw"
                : "(min-width: 768px) 33vw, 100vw"
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">{product.title}</p>
        <Price
          amount={product.priceRange.maxVariantPrice.amount}
          currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          className="text-sm text-blue-600 dark:text-blue-500"
          currencyCodeClassName="hidden"
        />
      </div>
    </Link>
  );
}

export async function FeaturedGrid() {
  const products = await getCollectionProducts({
    collection: featured.collection,
  });
  // The hero shows product 1; this grid takes the next three.
  const items = products.slice(1, 4);

  if (!items.length) return null;
  const [first, ...rest] = items;

  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-16 md:py-24">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {featured.heading}
        </h2>
        <Link
          href="/products"
          prefetch={true}
          className="hidden font-medium whitespace-nowrap text-neutral-600 transition-colors hover:text-blue-600 sm:block dark:text-neutral-400 dark:hover:text-blue-500"
        >
          View all
        </Link>
      </div>
      <div
        className={cn(
          "grid gap-6",
          rest.length > 0 && "md:grid-cols-6",
          rest.length === 2 && "md:grid-rows-2"
        )}
      >
        <FeaturedTile
          product={first!}
          large
          className={cn(rest.length > 0 && "md:col-span-4 md:row-span-full")}
        />
        {rest.map((product) => (
          <FeaturedTile
            key={product.handle}
            product={product}
            className="md:col-span-2"
          />
        ))}
      </div>
    </section>
  );
}
