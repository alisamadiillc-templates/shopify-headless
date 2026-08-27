import { getPage } from "lib/shopify";

import OpengraphImage from "components/opengraph-image";

interface ImageProps {
  params: Promise<{ page: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { page: pageHandle } = await params;
  const page = await getPage(pageHandle);
  const title = page.seo?.title || page.title;

  return await OpengraphImage({ title });
}
