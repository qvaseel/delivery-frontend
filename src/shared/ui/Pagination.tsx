import { Button } from "./Button";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="mt-6 flex items-center justify-between rounded-2xl border border-custom-border bg-custom-surface px-4 py-3">
      <Button
        variant="ghost"
        disabled={prevDisabled}
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </Button>

      <div className="text-sm text-custom-text-muted">
        Страница{" "}
        <span className="font-semibold text-custom-text">{page}</span> из{" "}
        <span className="font-semibold text-custom-text">{totalPages}</span>
      </div>

      <Button
        variant="ghost"
        disabled={nextDisabled}
        onClick={() => onPageChange(page + 1)}
      >
        Вперёд
      </Button>
    </div>
  );
}