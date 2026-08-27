import { cn } from "@/lib/utils";

interface ProseProps {
  html: string;
  className?: string;
}

const Prose = ({ html, className }: ProseProps) => {
  return (
    <div
      className={cn(
        "mx-auto prose max-w-6xl text-base leading-7 text-black dark:text-white prose-headings:mt-8 prose-headings:font-semibold prose-headings:tracking-wide prose-headings:text-black dark:prose-headings:text-white prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg prose-a:text-black prose-a:underline prose-a:hover:text-neutral-300 dark:prose-a:text-white prose-strong:text-black dark:prose-strong:text-white prose-ol:mt-8 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mt-8 prose-ul:list-disc prose-ul:pl-6",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Prose;
