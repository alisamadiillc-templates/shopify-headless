import { siteConfig } from "@/lib/site-config";

const { valueProps } = siteConfig;

export function ValueProps() {
  return (
    <section className="w-full bg-neutral-100 dark:bg-neutral-950">
      <div className="mx-auto grid w-full max-w-(--breakpoint-2xl) gap-10 px-4 py-16 md:py-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {valueProps.heading}
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {valueProps.body}
            </p>
          </div>
        </div>
        <div className="lg:col-span-8">
          {valueProps.items.map((item, i) => (
            <div
              key={item.title}
              className="grid grid-cols-[auto_1fr] gap-6 border-t border-neutral-200 py-8 first:border-t-0 first:pt-0 last:pb-0 md:gap-10 dark:border-neutral-800"
            >
              <span className="text-lg font-medium text-blue-600 tabular-nums dark:text-blue-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="mt-2 max-w-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
