import { ShoppingCartIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";

interface OpenCartProps {
  className?: string;
  quantity?: number;
}

export default function OpenCart({ className, quantity }: OpenCartProps) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <ShoppingCartIcon
        className={cn(
          "h-4 transition-all ease-in-out hover:scale-110",
          className
        )}
      />

      {quantity ? (
        <div className="absolute top-0 right-0 -mt-2 -mr-2 h-4 w-4 rounded-sm bg-blue-600 text-[11px] font-medium text-white">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
