import { siteConfig } from "@/lib/site-config";

import { CollectionTiles } from "@/components/home/collection-tiles";
import { FeaturedGrid } from "@/components/home/featured-grid";
import { Hero } from "@/components/home/hero";
import { LatestProducts } from "@/components/home/latest-products";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { ValueProps } from "@/components/home/value-props";
import Footer from "@/components/layout/footer";

const { sections } = siteConfig;

export const metadata = {
  description: siteConfig.brand.description,
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      {sections.featured ? <FeaturedGrid /> : null}
      {sections.valueProps ? <ValueProps /> : null}
      {sections.latest ? <LatestProducts /> : null}
      {sections.collections ? <CollectionTiles /> : null}
      {sections.newsletter ? <NewsletterBand /> : null}
      <Footer />
    </>
  );
}
