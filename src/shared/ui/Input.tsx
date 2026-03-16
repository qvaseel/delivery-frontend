import { cn } from "../lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
          {label}
        </div>
      ) : null}

      <input
        className={cn(
          "w-full rounded-2xl border bg-custom-surface px-4 py-2.5 text-sm text-custom-text outline-none placeholder:text-custom-text-subtle",
          error
            ? "border-custom-danger focus-visible:ring-2 focus-visible:ring-custom-danger/25"
            : "border-custom-border focus-visible:border-custom-border-strong focus-visible:ring-2 focus-visible:ring-custom-ring/25",
          className,
        )}
        {...props}
      />

      {error ? (
        <div className="mt-1.5 text-xs font-medium text-custom-danger">
          {error}
        </div>
      ) : null}
    </label>
  );
}