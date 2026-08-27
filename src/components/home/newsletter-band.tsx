import { siteConfig } from "@/lib/site-config";

import NewsletterForm from "@/components/layout/newsletter-form";

const { newsletter } = siteConfig;

export function NewsletterBand() {
  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-16 md:pb-24">
      <div className="grid gap-8 rounded-2xl bg-blue-600 p-8 text-white md:grid-cols-2 md:items-center md:p-14">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {newsletter.heading}
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-blue-100">
            {newsletter.body}
          </p>
        </div>
        <div className="md:min-w-[360px] md:justify-self-end">
          <NewsletterForm variant="band" />
        </div>
      </div>
    </section>
  );
}
