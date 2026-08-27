import { cn } from "@/lib/utils";

const dots = "mx-[1px] inline-block h-1 w-1 animate-blink rounded-md";

interface LoadingDotsProps {
  className: string;
}

const LoadingDots = ({ className }: LoadingDotsProps) => {
  return (
    <span className="mx-2 inline-flex items-center">
      <span className={cn(dots, className)} />
      <span className={cn(dots, "animation-delay-[200ms]", className)} />
      <span className={cn(dots, "animation-delay-[400ms]", className)} />
    </span>
  );
};

export default LoadingDots;
