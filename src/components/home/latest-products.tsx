import Image from "next/image";
import Link from "next/link";

import { getProducts } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

import Price from "@/components/price";

const { latest } = siteConfig;

export async function LatestProducts() {
  const products = await getProducts({ sortKey: "CREATED_AT", reverse: true });
  const items = products.slice(0, latest.count);

  if (!items.length) return null;

  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-16 md:py-24">
      <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">
        {latest.heading}
      </h2>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <li key={product.handle}>
            <Link
              href={`/product/${product.handle}`}
              prefetch={true}
              className="group flex flex-col gap-3"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                {product.featuredImage?.url ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium">{product.title}</p>
                <Price
                  amount={product.priceRange.maxVariantPrice.amount}
                  currencyCode={product.priceRange.maxVariantPrice.currencyCode}
                  className="text-sm text-blue-600 dark:text-blue-500"
                  currencyCodeClassName="hidden"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <Link
          href={latest.seeMore.href}
          prefetch={true}
          className="flex h-12 items-center rounded-full bg-blue-600 px-7 font-medium text-white transition-colors duration-200 hover:bg-blue-700 active:scale-[0.98]"
        >
          {latest.seeMore.label}
        </Link>
      </div>
    </section>
  );
}
