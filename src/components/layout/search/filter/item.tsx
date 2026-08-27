"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { SortFilterItem } from "@/lib/constants";
import { cn, createUrl } from "@/lib/utils";

import type { ListItem, PathFilterItem } from ".";

interface PathFilterItemProps {
  item: PathFilterItem;
}

function PathFilterItem({ item }: PathFilterItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === item.path;
  const newParams = new URLSearchParams(searchParams.toString());
  const DynamicTag = active ? "p" : Link;

  newParams.delete("q");

  return (
    <li className="mt-2 flex text-black dark:text-white" key={item.title}>
      <DynamicTag
        href={createUrl(item.path, newParams)}
        className={cn(
          "w-full text-sm underline-offset-4 hover:underline dark:hover:text-neutral-100",
          {
            "underline underline-offset-4": active,
          }
        )}
      >
        {item.title}
      </DynamicTag>
    </li>
  );
}

interface SortFilterItemProps {
  item: SortFilterItem;
}

function SortFilterItem({ item }: SortFilterItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("sort") === item.slug;
  const q = searchParams.get("q");
  const href = createUrl(
    pathname,
    new URLSearchParams({
      ...(q && { q }),
      ...(item.slug && item.slug.length && { sort: item.slug }),
    })
  );
  const DynamicTag = active ? "p" : Link;

  return (
    <li
      className="mt-2 flex text-sm text-black dark:text-white"
      key={item.title}
    >
      <DynamicTag
        prefetch={!active ? false : undefined}
        href={href}
        className={cn("w-full hover:underline hover:underline-offset-4", {
          "underline underline-offset-4": active,
        })}
      >
        {item.title}
      </DynamicTag>
    </li>
  );
}

interface FilterItemProps {
  item: ListItem;
}

export function FilterItem({ item }: FilterItemProps) {
  return "path" in item ? (
    <PathFilterItem item={item} />
  ) : (
    <SortFilterItem item={item} />
  );
}
