import { getCollection } from "@/lib/shopify";

import OpengraphImage from "@/components/opengraph-image";

interface ImageProps {
  params: Promise<{ collection: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { collection: collectionHandle } = await params;
  const collection = await getCollection(collectionHandle);
  const title = collection?.seo?.title || collection?.title;

  return await OpengraphImage({ title });
}
