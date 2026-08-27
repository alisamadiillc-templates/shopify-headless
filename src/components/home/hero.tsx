import Image from "next/image";
import Link from "next/link";

import { getCollectionProducts } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

import Price from "@/components/price";

const { hero } = siteConfig;

function HeroCopy() {
  return (
    <div className="flex flex-col items-start justify-center gap-6 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
      <p className="text-[11px] font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400">
        {hero.eyebrow}
      </p>
      <h1 className="max-w-xl text-4xl leading-none font-semibold tracking-tighter text-balance md:text-5xl lg:text-6xl">
        {hero.headline}
      </h1>
      <p className="max-w-md leading-relaxed text-neutral-600 dark:text-neutral-400">
        {hero.subtext}
      </p>
      <div className="mt-2 flex items-center gap-6">
        <Link
          href={hero.cta.href}
          prefetch={true}
          className="flex h-12 items-center rounded-full bg-blue-600 px-7 font-medium text-white transition-colors duration-200 hover:bg-blue-700 active:scale-[0.98]"
        >
          {hero.cta.label}
        </Link>
        <Link
          href={hero.secondaryCta.href}
          className="font-medium text-neutral-900 underline underline-offset-4 transition-colors hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-500"
        >
          {hero.secondaryCta.label}
        </Link>
      </div>
    </div>
  );
}

export async function Hero() {
  const products = await getCollectionProducts({
    collection: hero.collection,
  });
  const product = products[0];

  return (
    <section className="mx-auto grid w-full max-w-(--breakpoint-2xl) gap-10 px-4 pt-10 pb-16 lg:min-h-[85dvh] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-0 lg:pb-8">
      <div className="lg:col-span-5">
        <HeroCopy />
      </div>
      {product ? (
        <Link
          href={`/product/${product.handle}`}
          prefetch={true}
          className="group relative block overflow-hidden rounded-xl bg-neutral-100 lg:col-span-7 dark:bg-neutral-800"
        >
          <div className="relative aspect-[4/3] w-full">
            {product.featuredImage?.url ? (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : null}
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/90 py-2 pr-4 pl-5 text-sm backdrop-blur-sm dark:bg-black/70">
            <span className="font-medium">{product.title}</span>
            <Price
              amount={product.priceRange.maxVariantPrice.amount}
              currencyCode={product.priceRange.maxVariantPrice.currencyCode}
              className="text-blue-600 dark:text-blue-500"
              currencyCodeClassName="hidden"
            />
          </div>
        </Link>
      ) : null}
    </section>
  );
}
