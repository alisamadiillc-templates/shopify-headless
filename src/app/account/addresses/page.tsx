import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCustomerAddresses } from "@/lib/shopify/customer";

import { Skeleton } from "@/components/ui/skeleton";
import Addresses from "@/components/account/addresses";

async function AddressBook() {
  const result = await getCustomerAddresses();

  if (!result) {
    redirect("/api/auth/login?return_to=/account/addresses");
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Addresses</h2>
      <Addresses
        addresses={result.addresses}
        defaultAddressId={result.defaultAddressId}
      />
    </div>
  );
}

export default function AddressesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <AddressBook />
    </Suspense>
  );
}
