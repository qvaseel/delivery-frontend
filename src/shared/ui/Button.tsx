import { cn } from "../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  disabled,
  ...props
}: Props) {
  const base =
    "inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 outline-none";
  const focus =
    "focus-visible:ring-2 focus-visible:ring-custom-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-custom-bg";
  const disabledStyles =
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";

  const styles =
    variant === "primary"
      ? "bg-custom-primary text-custom-primary-foreground shadow-sm hover:bg-custom-primary-hover"
      : variant === "danger"
        ? "bg-custom-danger text-white shadow-sm hover:bg-custom-danger-hover"
        : "border border-custom-border bg-custom-surface text-custom-text hover:border-custom-border-strong hover:bg-custom-surface-soft";

  return (
    <button
      className={cn(base, focus, disabledStyles, styles, className)}
      disabled={disabled}
      {...props}
    />
  );
}