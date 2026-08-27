"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { title: "Profile", href: "/account" },
  { title: "Orders", href: "/account/orders" },
  { title: "Addresses", href: "/account/addresses" },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-4 md:flex-col md:gap-2">
      {links.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={true}
            className={cn(
              "text-sm underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300",
              active
                ? "font-medium text-black dark:text-white"
                : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {link.title}
          </Link>
        );
      })}
      <a
        href="/api/auth/logout"
        className="text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
      >
        Sign out
      </a>
    </nav>
  );
}
