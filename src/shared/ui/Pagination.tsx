import { Button } from "./Button";

type Props = {
  page: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange: (p: number) => void;
};

function getVisiblePages(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);

  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const visiblePages = getVisiblePages(page, totalPages);
  const rangeStart =
    typeof totalCount === "number" && typeof pageSize === "number"
      ? (page - 1) * pageSize + 1
      : null;
  const rangeEnd =
    typeof totalCount === "number" && typeof pageSize === "number"
      ? Math.min(page * pageSize, totalCount)
      : null;

  return (
    <div className="mt-6 rounded-2xl border border-custom-border bg-custom-surface px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-custom-text-muted">
          {rangeStart !== null && rangeEnd !== null && typeof totalCount === "number"
            ? (
                <>
                  Показаны{" "}
                  <span className="font-semibold text-custom-text">
                    {rangeStart}-{rangeEnd}
                  </span>{" "}
                  из{" "}
                  <span className="font-semibold text-custom-text">
                    {totalCount}
                  </span>
                </>
              )
            : (
                <>
                  Страница{" "}
                  <span className="font-semibold text-custom-text">{page}</span> из{" "}
                  <span className="font-semibold text-custom-text">
                    {totalPages}
                  </span>
                </>
              )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            disabled={prevDisabled}
            onClick={() => onPageChange(page - 1)}
          >
            Назад
          </Button>

          <div className="flex items-center gap-1">
            {visiblePages.map((visiblePage, index) => {
              const previousPage = visiblePages[index - 1];
              const shouldShowGap =
                typeof previousPage === "number" && visiblePage - previousPage > 1;

              return (
                <div key={visiblePage} className="flex items-center gap-1">
                  {shouldShowGap ? (
                    <span className="px-1 text-custom-text-subtle">...</span>
                  ) : null}
                  <Button
                    variant={visiblePage === page ? "primary" : "ghost"}
                    onClick={() => onPageChange(visiblePage)}
                    className="min-w-10 px-3"
                  >
                    {visiblePage}
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            variant="ghost"
            disabled={nextDisabled}
            onClick={() => onPageChange(page + 1)}
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
}
