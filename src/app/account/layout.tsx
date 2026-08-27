import { Suspense } from "react";

import AccountNav from "@/components/account/account-nav";

export const metadata = {
  title: "Account",
  description: "Manage your account, orders, and addresses.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-(--breakpoint-lg) px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My account</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-40 md:shrink-0">
          <Suspense fallback={null}>
            <AccountNav />
          </Suspense>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
