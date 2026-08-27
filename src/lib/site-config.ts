/**
 * The re-skin surface. To adapt this storefront for a new client:
 * edit this file (copy + section toggles) and swap the Shopify env vars.
 * Nothing in src/components/home reads brand copy from anywhere else.
 */

export const siteConfig = {
  brand: {
    name: process.env.SITE_NAME || "Nook & Corner",
    description:
      "Compact furniture for apartments and small homes: fold-away desks, wall beds, and storage that earns its footprint.",
  },
  hero: {
    eyebrow: "Small-space furniture",
    headline: "Make every square foot work",
    subtext:
      "Compact sofas, fold-away desks, and clever storage built for apartments.",
    cta: { label: "Shop the collection", href: "/products" },
    secondaryCta: { label: "Browse by room", href: "#collections" },
    // Hero image = first product of this collection.
    collection: "frontpage",
  },
  featured: {
    heading: "Made for tight corners",
    collection: "frontpage",
  },
  valueProps: {
    heading: "Why small-space first",
    body: "Every piece is designed around one constraint: the room is not getting bigger.",
    items: [
      {
        title: "Built to fold, stack, and tuck",
        body: "Beds, desks, and tables that give the floor back when you are done with them.",
      },
      {
        title: "Sized for real apartments",
        body: "Slimmer depths and smaller footprints, without shrinking the comfort.",
      },
      {
        title: "Delivered flat, assembled fast",
        body: "Everything ships flat-packed and builds with one tool in under half an hour.",
      },
    ],
  },
  latest: {
    heading: "New this season",
    count: 8,
    seeMore: { label: "See more", href: "/products" },
  },
  collections: {
    heading: "Shop by room",
    // Collection handles hidden from the tiles section.
    exclude: ["frontpage", "all", ""],
  },
  newsletter: {
    heading: "First dibs on new pieces",
    body: "One email a month: new furniture, restocks, and small-space ideas.",
  },
  productsPage: {
    title: "All furniture",
    description: "Every piece in the collection, made for small spaces.",
  },
  sections: {
    featured: true,
    valueProps: true,
    latest: true,
    collections: true,
    newsletter: true,
  },
};

export type SiteConfig = typeof siteConfig;
