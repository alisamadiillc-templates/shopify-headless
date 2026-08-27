import { getCollection } from "lib/shopify";

import OpengraphImage from "components/opengraph-image";

export default async function Image({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: collectionHandle } = await params;
  const collection = await getCollection(collectionHandle);
  const title = collection?.seo?.title || collection?.title;

  return await OpengraphImage({ title });
}
