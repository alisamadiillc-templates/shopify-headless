import { cn } from "@/lib/utils";

interface PriceProps extends React.ComponentProps<"p"> {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
}

const Price = ({
  amount,
  className,
  currencyCode = "USD",
  currencyCodeClassName,
}: PriceProps) => (
  <p suppressHydrationWarning={true} className={className}>
    {`${new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(parseFloat(amount))}`}
    <span
      className={cn("ml-1 inline", currencyCodeClassName)}
    >{`${currencyCode}`}</span>
  </p>
);

export default Price;
