"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { Menu } from "@/lib/shopify/types";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import Search, { SearchSkeleton } from "./search";

interface MobileMenuProps {
  menu: Menu[];
}

export default function MobileMenu({ menu }: MobileMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        aria-label="Open mobile menu"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors md:hidden dark:border-neutral-700 dark:text-white"
      >
        <Bars3Icon className="h-4" />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex h-full w-full max-w-none flex-col gap-0 border-r-0 bg-white pb-6 sm:max-w-none dark:bg-black"
      >
        <SheetTitle className="sr-only">Mobile menu</SheetTitle>
        <div className="p-4">
          <button
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            <XMarkIcon className="h-6" />
          </button>

          <div className="mb-4 w-full">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          {menu.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item: Menu) => (
                <li
                  className="py-2 text-xl text-black transition-colors hover:text-neutral-500 dark:text-white"
                  key={item.title}
                >
                  <Link
                    href={item.path}
                    prefetch={true}
                    onClick={closeMobileMenu}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
