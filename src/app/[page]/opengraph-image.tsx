import { getPage } from "lib/shopify";

import OpengraphImage from "components/opengraph-image";

export default async function Image({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageHandle } = await params;
  const page = await getPage(pageHandle);
  const title = page.seo?.title || page.title;

  return await OpengraphImage({ title });
}
