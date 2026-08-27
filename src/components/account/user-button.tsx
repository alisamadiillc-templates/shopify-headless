import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";

import { getCustomer } from "@/lib/shopify/customer";

function UserIconBox({ filled }: { filled?: boolean }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <UserCircleIcon className="h-4 transition-all ease-in-out hover:scale-110" />
      {filled ? (
        <div className="absolute top-0 right-0 -mt-1 -mr-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
      ) : null}
    </div>
  );
}

export function UserButtonSkeleton() {
  return <UserIconBox />;
}

export default async function UserButton() {
  const customer = await getCustomer();

  return customer ? (
    <Link href="/account" prefetch={true} aria-label="My account">
      <UserIconBox filled />
    </Link>
  ) : (
    <a href="/api/auth/login" aria-label="Log in">
      <UserIconBox />
    </a>
  );
}
