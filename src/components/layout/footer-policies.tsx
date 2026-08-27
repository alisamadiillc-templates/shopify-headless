import Link from "next/link";

import { getShopPolicies } from "@/lib/shopify";

export default async function FooterPolicies() {
  const policies = await getShopPolicies();

  if (!policies.length) return null;

  return (
    <nav className="md:ml-auto">
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-end">
        {policies.map((policy) => (
          <li key={policy.handle}>
            <Link
              href={`/policies/${policy.handle}`}
              className="underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300"
            >
              {policy.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
