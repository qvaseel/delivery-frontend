import { cn } from "../lib/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-custom-border bg-custom-surface shadow-[0_1px_2px_rgba(2,6,23,0.04),0_10px_24px_rgba(2,6,23,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.22),0_10px_30px_rgba(0,0,0,0.24)]",
        className,
      )}
      {...props}
    />
  );
}