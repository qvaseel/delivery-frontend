import { cn } from "../lib/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-custom-border bg-custom-surface-soft/70 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mx-auto max-w-md">
        <div className="text-lg font-semibold text-custom-text">{title}</div>
        <p className="mt-2 text-sm leading-6 text-custom-text-muted">
          {description}
        </p>
        {actions ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
