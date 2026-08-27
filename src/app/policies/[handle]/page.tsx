import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getShopPolicy } from "@/lib/shopify";
import { POLICY_HANDLES } from "@/lib/shopify/queries/policies";

import Prose from "@/components/prose";

interface PolicyPageProps {
  params: Promise<{ handle: string }>;
}

export function generateStaticParams() {
  return Object.keys(POLICY_HANDLES).map((handle) => ({ handle }));
}

export async function generateMetadata(
  props: PolicyPageProps
): Promise<Metadata> {
  const params = await props.params;
  const policy = await getShopPolicy(params.handle);

  if (!policy) return notFound();

  return {
    title: policy.title,
  };
}

export default async function PolicyPage(props: PolicyPageProps) {
  const params = await props.params;
  const policy = await getShopPolicy(params.handle);

  if (!policy) return notFound();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{policy.title}</h1>
      <Prose className="mb-8" html={policy.body} />
    </>
  );
}
