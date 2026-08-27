import { Suspense } from "react";

import { defaultSort, sorting } from "@/lib/constants";
import { getProducts } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

import Grid from "@/components/grid";
import Footer from "@/components/layout/footer";
import ProductGridItems from "@/components/layout/product-grid-items";
import FilterList from "@/components/layout/search/filter";

export const metadata = {
  title: siteConfig.productsPage.title,
  description: siteConfig.productsPage.description,
};

interface ProductsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ProductList({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { sort } = (params ?? {}) as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const products = await getProducts({ sortKey, reverse });

  if (!products.length) {
    return (
      <p className="py-12 text-neutral-600 dark:text-neutral-400">
        No products yet. Check back soon.
      </p>
    );
  }

  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProductGridItems products={products} />
    </Grid>
  );
}

function ProductListSkeleton() {
  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
        />
      ))}
    </Grid>
  );
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <>
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-8">
        <div className="flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {siteConfig.productsPage.title}
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {siteConfig.productsPage.description}
            </p>
          </div>
          <div className="flex-none md:w-[125px]">
            <Suspense fallback={null}>
              <FilterList list={sorting} title="Sort by" />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList searchParams={props.searchParams} />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
