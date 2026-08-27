import { cn } from "@/lib/utils";

const prettify = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

export default function OrderStatusBadge({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  return (
    <span
      className={cn(
        "rounded-sm px-2 py-0.5 text-xs font-medium",
        status === "PAID" || status === "SUCCESS"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      )}
    >
      {prettify(status)}
    </span>
  );
}
