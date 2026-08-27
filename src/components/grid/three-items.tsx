import Link from "next/link";

import { getCollectionProducts } from "lib/shopify";
import type { Product } from "lib/shopify/types";

import { GridTileImage } from "components/grid/tile";

interface ThreeItemGridItemProps {
  item: Product;
  size: "full" | "half";
  priority?: boolean;
}

function ThreeItemGridItem({ item, size, priority }: ThreeItemGridItemProps) {
  return (
    <div
      className={
        size === "full"
          ? "md:col-span-4 md:row-span-2"
          : "md:col-span-2 md:row-span-1"
      }
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={item.featuredImage.url}
          fill
          sizes={
            size === "full"
              ? "(min-width: 768px) 66vw, 100vw"
              : "(min-width: 768px) 33vw, 100vw"
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === "full" ? "center" : "bottom",
            title: item.title as string,
            amount: item.priceRange.maxVariantPrice.amount,
            currencyCode: item.priceRange.maxVariantPrice.currencyCode,
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  const homepageItems = await getCollectionProducts({
    collection: "frontpage",
  });

  if (!homepageItems.length) return null;

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      {homepageItems.slice(0, 3).map((item, i) => (
        <ThreeItemGridItem
          key={item.handle}
          size={i === 0 ? "full" : "half"}
          item={item}
          priority={i < 2}
        />
      ))}
    </section>
  );
}
