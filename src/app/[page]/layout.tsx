import { Suspense } from "react";

import Footer from "components/layout/footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="w-full">
        <div className="mx-8 max-w-2xl py-20 sm:mx-auto">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
}
