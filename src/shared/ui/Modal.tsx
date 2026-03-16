import { cn } from "../lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-custom-overlay/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative w-full max-w-lg rounded-3xl border border-custom-border bg-custom-surface-elevated shadow-[0_20px_60px_rgba(2,6,23,0.24)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] max-h-200 overflow-auto",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-custom-border px-5 py-4">
          <div className="text-base font-semibold text-custom-text">
            {title}
          </div>

          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm font-medium text-custom-text-muted transition hover:bg-custom-surface-soft hover:text-custom-text"
          >
            Закрыть
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
