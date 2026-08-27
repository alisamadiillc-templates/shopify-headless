/**
 * Seed the Shopify store with 25 small-space furniture products.
 *
 * Self-contained on purpose: `node --experimental-strip-types` does not honor
 * tsconfig path aliases, so this carries its own minimal Admin API client
 * (mirrors src/lib/shopify/admin/index.ts).
 *
 * Run: pnpm seed
 *   (= node --env-file=.env --experimental-strip-types scripts/seed-products.ts)
 *
 * Requires admin scopes: read_products, write_products, read_publications,
 * write_publications. The script checks and prints instructions if missing.
 */

const ADMIN_API_VERSION = "2025-07";

const rawDomain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const domain = rawDomain.startsWith("https://")
  ? rawDomain
  : `https://${rawDomain}`;
const endpoint = `${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

const PEXELS_KEY = process.env.PEXELS_API_KEY ?? "";

if (!rawDomain) {
  console.error("SHOPIFY_STORE_DOMAIN is not set");
  process.exit(1);
}
if (!PEXELS_KEY) {
  console.error("PEXELS_API_KEY is not set");
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Admin client (mirror of src/lib/shopify/admin/index.ts)             */
/* ------------------------------------------------------------------ */

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (staticToken) return staticToken;

  if (cachedToken && Date.now() < cachedToken.expiresAt)
    return cachedToken.value;

  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Set SHOPIFY_ADMIN_ACCESS_TOKEN, or SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET"
    );
  }

  const result = await fetch(`${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!result.ok) {
    throw new Error(
      `Admin token request failed (${result.status}): ${await result.text()}`
    );
  }
  const body = (await result.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000 - 60_000,
  };
  return body.access_token;
}

async function adminFetch<T = any>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const key = await getAdminAccessToken();
  const result = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": key,
    },
    body: JSON.stringify({ query, ...(variables && { variables }) }),
  });
  const body = (await result.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (body.errors?.length) {
    throw new Error(
      `GraphQL error: ${body.errors.map((e) => e.message).join("; ")}`
    );
  }
  if (!body.data) {
    throw new Error(`Empty response (${result.status})`);
  }
  return body.data;
}

function throwUserErrors(label: string, errors?: { message: string }[]) {
  if (errors?.length) {
    throw new Error(`${label}: ${errors.map((e) => e.message).join("; ")}`);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Pexels                                                              */
/* ------------------------------------------------------------------ */

const usedPhotoIds = new Set<number>();

type PexelsPhoto = {
  id: number;
  alt: string;
  src: { large2x: string };
};

async function pexelsImages(
  query: string,
  count: number
): Promise<{ url: string; alt: string }[]> {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`,
    { headers: { Authorization: PEXELS_KEY } }
  );
  if (!res.ok) {
    throw new Error(`Pexels ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as { photos: PexelsPhoto[] };
  const fresh = body.photos.filter((p) => !usedPhotoIds.has(p.id));
  const picked = fresh.slice(0, count);
  picked.forEach((p) => usedPhotoIds.add(p.id));
  return picked.map((p) => ({ url: p.src.large2x, alt: p.alt || query }));
}

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

type CatalogEntry = {
  title: string;
  handle: string;
  description: string;
  productType: string;
  tags: string[];
  price: string;
  pexelsQuery: string;
  category: "seating" | "desks-storage" | "tables" | "balcony";
  featured?: boolean;
};

const VENDOR = "Nook & Corner";

const CATALOG: CatalogEntry[] = [
  {
    title: "Alcove Compact 2-Seat Sofa",
    handle: "alcove-compact-2-seat-sofa",
    description:
      "A 64-inch sofa scaled for studio living rooms. Slim track arms and raised legs keep the footprint light while the deep seat stays comfortable.",
    productType: "Sofas",
    tags: ["small-space", "seating", "living-room"],
    price: "899.00",
    pexelsQuery: "small sofa apartment living room",
    category: "seating",
    featured: true,
  },
  {
    title: "Foldaway Loveseat Sleeper",
    handle: "foldaway-loveseat-sleeper",
    description:
      "Loveseat by day, single bed by night. The back folds flat in one motion, so a home office doubles as a guest room without moving furniture.",
    productType: "Sofas",
    tags: ["small-space", "seating", "sleeper"],
    price: "749.00",
    pexelsQuery: "loveseat small apartment",
    category: "seating",
  },
  {
    title: "Ledger Fold-Out Wall Desk",
    handle: "ledger-fold-out-wall-desk",
    description:
      "A wall-mounted desk that closes into a 6-inch-deep cabinet. Inside: cable pass-through, cork pinboard, and room for a laptop and two notebooks.",
    productType: "Desks",
    tags: ["small-space", "desk", "home-office"],
    price: "329.00",
    pexelsQuery: "wall mounted fold desk small workspace",
    category: "desks-storage",
    featured: true,
  },
  {
    title: "Rung Ladder Desk",
    handle: "rung-ladder-desk",
    description:
      "Leans against the wall on a 22-inch footprint. Two shelves above the work surface hold books and plants where floor space cannot.",
    productType: "Desks",
    tags: ["small-space", "desk", "shelving"],
    price: "259.00",
    pexelsQuery: "ladder desk shelf apartment workspace",
    category: "desks-storage",
  },
  {
    title: "Trio Nesting Coffee Tables",
    handle: "trio-nesting-coffee-tables",
    description:
      "Three tables that store as one. Pull them apart for guests, tuck them together when the living room needs to be a yoga studio.",
    productType: "Tables",
    tags: ["small-space", "table", "living-room"],
    price: "289.00",
    pexelsQuery: "nesting coffee tables living room",
    category: "tables",
    featured: true,
  },
  {
    title: "Sill Narrow Console Table",
    handle: "sill-narrow-console-table",
    description:
      "Ten inches deep, so it fits behind a sofa or in the slimmest hallway. Solid oak top with a steel base that will not wobble.",
    productType: "Tables",
    tags: ["small-space", "table", "hallway"],
    price: "349.00",
    pexelsQuery: "narrow console table hallway",
    category: "tables",
  },
  {
    title: "Gateleg Drop-Leaf Dining Table",
    handle: "gateleg-drop-leaf-dining-table",
    description:
      "Seats four with both leaves up, slides against the wall at 12 inches with both down. The classic small-apartment dinner table, rebuilt in beech.",
    productType: "Tables",
    tags: ["small-space", "table", "dining"],
    price: "499.00",
    pexelsQuery: "drop leaf dining table small kitchen",
    category: "tables",
    featured: true,
  },
  {
    title: "Datum Floating Shelf Set",
    handle: "datum-floating-shelf-set",
    description:
      "Three solid-wood shelves with hidden brackets. Storage that uses the one dimension small homes have plenty of: the wall.",
    productType: "Shelving",
    tags: ["small-space", "shelving", "storage"],
    price: "129.00",
    pexelsQuery: "floating wall shelves living room",
    category: "desks-storage",
  },
  {
    title: "Quoin Corner Shelf Unit",
    handle: "quoin-corner-shelf-unit",
    description:
      "Five tiers that wrap a 90-degree corner. Turns the least usable spot in the room into a library, plant stand, or pantry overflow.",
    productType: "Shelving",
    tags: ["small-space", "shelving", "corner"],
    price: "189.00",
    pexelsQuery: "corner shelf unit plants",
    category: "desks-storage",
  },
  {
    title: "Matrix Pegboard Organizer",
    handle: "matrix-pegboard-organizer",
    description:
      "A birch pegboard with movable shelves, hooks, and cups. Rearrange it weekly: entryway today, craft wall tomorrow, kitchen rail next month.",
    productType: "Storage",
    tags: ["small-space", "storage", "wall"],
    price: "149.00",
    pexelsQuery: "pegboard wall organizer workspace",
    category: "desks-storage",
  },
  {
    title: "Hollow Storage Ottoman",
    handle: "hollow-storage-ottoman",
    description:
      "Footrest, extra seat, and 60 liters of hidden storage in one cube. The lid flips to a serving tray for coffee-table duty.",
    productType: "Storage",
    tags: ["small-space", "storage", "seating"],
    price: "179.00",
    pexelsQuery: "storage ottoman living room",
    category: "seating",
  },
  {
    title: "Vestibule Storage Bench",
    handle: "vestibule-storage-bench",
    description:
      "Sit down to put on shoes, lift the seat to stow them. Forty-two inches wide, built for entryways that are really just a wall.",
    productType: "Storage",
    tags: ["small-space", "storage", "entryway"],
    price: "269.00",
    pexelsQuery: "entryway storage bench shoes",
    category: "seating",
  },
  {
    title: "Pivot Murphy Wall Bed",
    handle: "pivot-murphy-wall-bed",
    description:
      "A full-size bed that folds into a 16-inch-deep cabinet. Gas pistons make raising it a one-hand job; the room gets its floor back every morning.",
    productType: "Beds",
    tags: ["small-space", "bed", "bedroom"],
    price: "1899.00",
    pexelsQuery: "murphy bed small apartment",
    category: "desks-storage",
    featured: true,
  },
  {
    title: "Berth Daybed with Drawers",
    handle: "berth-daybed-with-drawers",
    description:
      "Sofa in the daytime, twin bed at night, two full-width drawers underneath. The workhorse of studio apartments.",
    productType: "Beds",
    tags: ["small-space", "bed", "storage"],
    price: "849.00",
    pexelsQuery: "daybed with storage drawers bedroom",
    category: "seating",
  },
  {
    title: "Sub-Rosa Under-Bed Boxes",
    handle: "sub-rosa-under-bed-boxes",
    description:
      "Two low-profile boxes on casters, sized to clear a standard bed frame. Felt-lined for sweaters, blankets, or the things you swore you would sort.",
    productType: "Storage",
    tags: ["small-space", "storage", "bedroom"],
    price: "139.00",
    pexelsQuery: "under bed storage boxes bedroom",
    category: "desks-storage",
  },
  {
    title: "Perch Balcony Bistro Set",
    handle: "perch-balcony-bistro-set",
    description:
      "A folding table and two chairs in powder-coated steel. Fits a 4-by-3-foot balcony and stores flat against the railing all winter.",
    productType: "Balcony",
    tags: ["small-space", "balcony", "outdoor"],
    price: "389.00",
    pexelsQuery: "balcony bistro table chairs",
    category: "balcony",
  },
  {
    title: "Rail-Hung Folding Balcony Chair",
    handle: "rail-hung-folding-balcony-chair",
    description:
      "Folds to two inches thick and hangs from the balcony rail when not in use. Teak slats weather from honey to silver.",
    productType: "Balcony",
    tags: ["small-space", "balcony", "outdoor"],
    price: "159.00",
    pexelsQuery: "folding chair balcony outdoor",
    category: "balcony",
  },
  {
    title: "Stax Stacking Stools, Set of 2",
    handle: "stax-stacking-stools-set-of-2",
    description:
      "Two stools that nest into the footprint of one. Extra seating, side table, or plant stand, depending on the hour.",
    productType: "Seating",
    tags: ["small-space", "seating", "flexible"],
    price: "199.00",
    pexelsQuery: "wooden stools stacked interior",
    category: "seating",
  },
  {
    title: "Turnstile Slim Shoe Cabinet",
    handle: "turnstile-slim-shoe-cabinet",
    description:
      "Seven inches deep, holds twelve pairs. Tilting compartments keep shoes upright so a hallway stays a hallway.",
    productType: "Storage",
    tags: ["small-space", "storage", "entryway"],
    price: "229.00",
    pexelsQuery: "slim shoe cabinet hallway",
    category: "desks-storage",
  },
  {
    title: "Lintel Over-Door Organizer",
    handle: "lintel-over-door-organizer",
    description:
      "A steel shelf that mounts above the door frame, the last unclaimed storage in any apartment. Rated for 25 pounds of books or boxes.",
    productType: "Storage",
    tags: ["small-space", "storage", "wall"],
    price: "89.00",
    pexelsQuery: "shelf above door storage",
    category: "desks-storage",
  },
  {
    title: "Screenplay Room Divider Shelf",
    handle: "screenplay-room-divider-shelf",
    description:
      "An open shelf that splits a studio into bedroom and living room without blocking light. Anchors to floor and ceiling, no wall required.",
    productType: "Shelving",
    tags: ["small-space", "shelving", "divider"],
    price: "579.00",
    pexelsQuery: "open shelf room divider studio",
    category: "desks-storage",
  },
  {
    title: "Fjord Wall-Mounted Drying Rack",
    handle: "fjord-wall-mounted-drying-rack",
    description:
      "Folds flat to three inches against the laundry wall, opens to 11 feet of drying line. Beech frame, no sagging plastic.",
    productType: "Storage",
    tags: ["small-space", "laundry", "wall"],
    price: "119.00",
    pexelsQuery: "wall drying rack laundry",
    category: "desks-storage",
  },
  {
    title: "Snug Compact Armchair",
    handle: "snug-compact-armchair",
    description:
      "A reading chair with real depth in a 28-inch width. High back, low arms, and a silhouette that does not swallow the corner it sits in.",
    productType: "Seating",
    tags: ["small-space", "seating", "living-room"],
    price: "549.00",
    pexelsQuery: "compact armchair reading corner",
    category: "seating",
  },
  {
    title: "Accordion Expandable Bookcase",
    handle: "accordion-expandable-bookcase",
    description:
      "Slides from 24 to 46 inches wide as your shelves fill. Buy one bookcase for the small flat now and the bigger one later.",
    productType: "Shelving",
    tags: ["small-space", "shelving", "books"],
    price: "319.00",
    pexelsQuery: "bookcase small apartment books",
    category: "desks-storage",
  },
  {
    title: "Galley Rolling Kitchen Cart",
    handle: "galley-rolling-kitchen-cart",
    description:
      "Counter space on wheels: butcher-block top, towel rail, two shelves. Rolls to the table for serving and parks in a 20-inch gap.",
    productType: "Storage",
    tags: ["small-space", "kitchen", "storage"],
    price: "279.00",
    pexelsQuery: "kitchen cart rolling small kitchen",
    category: "tables",
  },
];

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

const REQUIRED_SCOPES = [
  "write_products",
  "read_products",
  "write_publications",
  "read_publications",
];

async function checkScopes() {
  const data = await adminFetch<{
    currentAppInstallation: { accessScopes: { handle: string }[] };
  }>(`{ currentAppInstallation { accessScopes { handle } } }`);
  const have = new Set(
    data.currentAppInstallation.accessScopes.map((s) => s.handle)
  );
  const missing = REQUIRED_SCOPES.filter((s) => !have.has(s));
  if (missing.length) {
    console.error(`\nMissing admin API scopes: ${missing.join(", ")}\n`);
    console.error(
      [
        "Fix:",
        "  1. Open the Shopify Dev Dashboard -> your app -> Configuration",
        "     (or for a store custom app: store admin -> Settings -> Apps and",
        "      sales channels -> Develop apps -> your app -> Configuration).",
        "  2. Under Admin API integration scopes add:",
        `       ${REQUIRED_SCOPES.join(", ")}`,
        "     (keep the existing customer scopes).",
        "  3. Save / release the new version, then re-run: pnpm seed",
        "     (client-credentials tokens pick up new scopes on the next mint).",
      ].join("\n")
    );
    process.exit(1);
  }
  console.log("Scopes OK");
}

type Publication = { id: string; name: string };

async function getPublications(): Promise<Publication[]> {
  const data = await adminFetch<{
    publications: { nodes: Publication[] };
  }>(`{ publications(first: 20) { nodes { id name } } }`);
  const pubs = data.publications.nodes;
  const wanted = pubs.filter((p) => /headless|online store/i.test(p.name));
  if (!wanted.some((p) => /headless/i.test(p.name))) {
    console.error(
      `No "Headless" publication found. Installed publications: ${pubs
        .map((p) => p.name)
        .join(", ")}\nInstall the Headless channel on the store, then re-run.`
    );
    process.exit(1);
  }
  console.log(`Publishing to: ${wanted.map((p) => p.name).join(", ")}`);
  return wanted;
}

async function publish(id: string, publications: Publication[]) {
  const data = await adminFetch<{
    publishablePublish: { userErrors: { message: string }[] };
  }>(
    /* GraphQL */ `
      mutation publish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          userErrors {
            message
          }
        }
      }
    `,
    { id, input: publications.map((p) => ({ publicationId: p.id })) }
  );
  throwUserErrors("publishablePublish", data.publishablePublish.userErrors);
}

type CollectionInfo = {
  id: string;
  ruleSet: { rules: { column: string; condition: string }[] } | null;
} | null;

async function getCollection(handle: string): Promise<CollectionInfo> {
  const data = await adminFetch<{ collectionByHandle: CollectionInfo }>(
    /* GraphQL */ `
      query collection($handle: String!) {
        collectionByHandle(handle: $handle) {
          id
          ruleSet {
            rules {
              column
              condition
            }
          }
        }
      }
    `,
    { handle }
  );
  return data.collectionByHandle;
}

async function createCollection(
  title: string,
  handle: string,
  publications: Publication[]
): Promise<string> {
  const data = await adminFetch<{
    collectionCreate: {
      collection: { id: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    /* GraphQL */ `
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
          }
          userErrors {
            message
          }
        }
      }
    `,
    { input: { title, handle } }
  );
  throwUserErrors("collectionCreate", data.collectionCreate.userErrors);
  const id = data.collectionCreate.collection!.id;
  await publish(id, publications);
  console.log(`Created collection "${title}" (${handle})`);
  return id;
}

async function addProductsToCollection(id: string, productIds: string[]) {
  if (!productIds.length) return;
  const data = await adminFetch<{
    collectionAddProducts: { userErrors: { message: string }[] };
  }>(
    /* GraphQL */ `
      mutation add($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          userErrors {
            message
          }
        }
      }
    `,
    { id, productIds }
  );
  throwUserErrors(
    "collectionAddProducts",
    data.collectionAddProducts.userErrors
  );
}

async function findProductByHandle(handle: string): Promise<string | null> {
  const data = await adminFetch<{
    productByIdentifier: { id: string } | null;
  }>(
    /* GraphQL */ `
      query find($handle: String!) {
        productByIdentifier(identifier: { handle: $handle }) {
          id
        }
      }
    `,
    { handle }
  );
  return data.productByIdentifier?.id ?? null;
}

async function createProduct(entry: CatalogEntry): Promise<string> {
  const images = await pexelsImages(entry.pexelsQuery, 2);
  if (!images.length) {
    throw new Error(`No Pexels results for "${entry.pexelsQuery}"`);
  }

  const data = await adminFetch<{
    productSet: {
      product: { id: string } | null;
      userErrors: { field?: string[]; message: string }[];
    };
  }>(
    /* GraphQL */ `
      mutation productSet($input: ProductSetInput!) {
        productSet(input: $input, synchronous: true) {
          product {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: {
        title: entry.title,
        handle: entry.handle,
        descriptionHtml: `<p>${entry.description}</p>`,
        vendor: VENDOR,
        productType: entry.productType,
        tags: entry.tags,
        status: "ACTIVE",
        files: images.map((img) => ({
          originalSource: img.url,
          alt: img.alt,
          contentType: "IMAGE",
        })),
        productOptions: [
          { name: "Title", values: [{ name: "Default Title" }] },
        ],
        variants: [
          {
            optionValues: [{ optionName: "Title", name: "Default Title" }],
            price: entry.price,
            inventoryPolicy: "CONTINUE",
            inventoryItem: { tracked: false },
          },
        ],
      },
    }
  );
  throwUserErrors(`productSet(${entry.handle})`, data.productSet.userErrors);
  return data.productSet.product!.id;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

const CATEGORY_COLLECTIONS: Record<string, string> = {
  seating: "Seating",
  "desks-storage": "Desks & Storage",
  tables: "Tables",
  balcony: "Balcony & Outdoor",
};

async function main() {
  console.log(`Seeding ${CATALOG.length} products into ${rawDomain}\n`);

  await checkScopes();
  const publications = await getPublications();

  // Frontpage collection
  let frontpage = await getCollection("frontpage");
  let frontpageManual = true;
  let frontpageId: string;
  if (!frontpage) {
    frontpageId = await createCollection(
      "Home page",
      "frontpage",
      publications
    );
  } else {
    frontpageId = frontpage.id;
    await publish(frontpageId, publications);
    if (frontpage.ruleSet) {
      frontpageManual = false;
      console.warn(
        'Warning: "frontpage" is a smart collection; cannot add products directly. Adjust its rules to match tag "featured" or manage manually.'
      );
    }
  }

  // Category collections
  const categoryIds: Record<string, string> = {};
  for (const [handle, title] of Object.entries(CATEGORY_COLLECTIONS)) {
    const existing = await getCollection(handle);
    if (existing) {
      categoryIds[handle] = existing.id;
      await publish(existing.id, publications);
    } else {
      categoryIds[handle] = await createCollection(title, handle, publications);
    }
  }

  // Products
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: { handle: string; error: string }[] = [];
  const featuredIds: string[] = [];
  const byCategory: Record<string, string[]> = {};

  for (const entry of CATALOG) {
    try {
      let id = await findProductByHandle(entry.handle);
      if (id) {
        skipped.push(entry.handle);
      } else {
        id = await createProduct(entry);
        created.push(entry.handle);
        console.log(`  + ${entry.title}`);
      }
      await publish(id, publications);
      if (entry.featured) featuredIds.push(id);
      (byCategory[entry.category] ??= []).push(id);
      await sleep(500);
    } catch (e) {
      failed.push({ handle: entry.handle, error: (e as Error).message });
      console.error(`  ! ${entry.handle}: ${(e as Error).message}`);
    }
  }

  // Collection membership
  if (frontpageManual) {
    await addProductsToCollection(frontpageId, featuredIds);
    console.log(`\nAdded ${featuredIds.length} featured products to frontpage`);
  }
  for (const [category, ids] of Object.entries(byCategory)) {
    await addProductsToCollection(categoryIds[category]!, ids);
  }

  console.log(
    [
      "",
      `Created: ${created.length}`,
      `Skipped (already existed): ${skipped.length}`,
      `Failed: ${failed.length}`,
      "",
      "Note: Shopify ingests images by URL asynchronously; product photos can",
      "take up to a minute to appear. Then flush the Next.js cache:",
      '  curl -X POST -H "x-shopify-topic: products/create" "http://localhost:3000/api/revalidate?secret=$SHOPIFY_REVALIDATION_SECRET"',
      '  curl -X POST -H "x-shopify-topic: collections/create" "http://localhost:3000/api/revalidate?secret=$SHOPIFY_REVALIDATION_SECRET"',
      "or restart `pnpm dev`.",
    ].join("\n")
  );

  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
