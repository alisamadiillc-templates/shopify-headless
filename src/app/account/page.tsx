import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCustomer } from "@/lib/shopify/customer";

import { Skeleton } from "@/components/ui/skeleton";
import ProfileForm from "@/components/account/profile-form";

async function Profile() {
  const customer = await getCustomer();

  if (!customer) {
    redirect("/api/auth/login?return_to=/account");
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Profile</h2>
      <ProfileForm customer={customer} />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex max-w-md flex-col gap-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <Profile />
    </Suspense>
  );
}
