"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

interface FooterMenuItemProps {
  item: Menu;
}

export function FooterMenuItem({ item }: FooterMenuItemProps) {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname === item.path);

  useEffect(() => {
    setActive(pathname === item.path);
  }, [pathname, item.path]);

  return (
    <li>
      <Link
        href={item.path}
        className={cn(
          "block p-2 text-lg underline-offset-4 hover:text-black hover:underline md:inline-block md:text-sm dark:hover:text-neutral-300",
          {
            "text-black dark:text-neutral-300": active,
          }
        )}
      >
        {item.title}
      </Link>
    </li>
  );
}

interface FooterMenuProps {
  menu: Menu[];
}

export default function FooterMenu({ menu }: FooterMenuProps) {
  if (!menu.length) return null;

  return (
    <nav>
      <ul>
        {menu.map((item: Menu) => {
          return <FooterMenuItem key={item.title} item={item} />;
        })}
      </ul>
    </nav>
  );
}
