import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "next-intl";

type PageItem = number | "ellipsis";

function getVisiblePages(currentPage: number, pageCount: number): PageItem[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", pageCount];
  }

  if (currentPage >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    pageCount,
  ];
}

export function TablePagination({
  currentPage,
  pageCount,
  from,
  to,
  total,
  itemLabel,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}) {
  const pages = getVisiblePages(currentPage, pageCount);
  const t = useTranslations("pagination");

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {t("showing", { from, to, total, itemLabel: itemLabel ?? t("items") })}
      </p>
      <Pagination className="justify-start md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            />
          </PaginationItem>
          {pages.map((item, index) => (
            <PaginationItem key={`${item}-${index}`}>
              {item === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationButton
                  isActive={item === currentPage}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </PaginationButton>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              disabled={currentPage === pageCount}
              onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLast
              disabled={currentPage === pageCount}
              onClick={() => onPageChange(pageCount)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
