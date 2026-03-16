import { cn } from "../lib/cn";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-custom-border bg-custom-surface-soft px-2.5 py-1 text-xs font-medium text-custom-text-muted",
        className,
      )}
      {...props}
    />
  );
}
