import Image from "next/image";
import Link from "next/link";

import { getCollectionProducts, getCollections } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

const { collections: config } = siteConfig;

export async function CollectionTiles() {
  const all = await getCollections();
  const visible = all.filter(
    (collection) => !config.exclude.includes(collection.handle)
  );

  if (visible.length < 2) return null;

  const tiles = await Promise.all(
    visible.slice(0, 4).map(async (collection) => {
      const products = await getCollectionProducts({
        collection: collection.handle,
      });
      return { collection, image: products[0]?.featuredImage };
    })
  );

  return (
    <section
      id="collections"
      className="mx-auto w-full max-w-(--breakpoint-2xl) scroll-mt-24 px-4 py-16 md:py-24"
    >
      <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">
        {config.heading}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {tiles.map(({ collection, image }) => (
          <Link
            key={collection.handle}
            href={collection.path}
            prefetch={true}
            className="group relative block aspect-[3/2] overflow-hidden rounded-xl bg-neutral-100 lg:aspect-[3/4] dark:bg-neutral-800"
          >
            {image?.url ? (
              <Image
                src={image.url}
                alt={image.altText || collection.title}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
              <span className="flex items-center gap-2 font-medium text-white">
                {collection.title}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
