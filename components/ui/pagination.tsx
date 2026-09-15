import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Pagination({
  className,
  ...props
}: ComponentProps<"nav">) {
  const t = useTranslations("pagination");

  return (
    <nav
      aria-label={t("label")}
      className={cn("flex w-full items-center justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem(props: ComponentProps<"li">) {
  return <li {...props} />;
}

export function PaginationButton({
  children,
  className,
  isActive = false,
  ...props
}: ComponentProps<"button"> & {
  isActive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-xs font-black transition",
        "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-45",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
        isActive &&
          "border-slate-950 bg-slate-950 text-white hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type IconPaginationButtonProps = Omit<
  ComponentProps<typeof PaginationButton>,
  "children"
>;

export function PaginationPrevious(props: IconPaginationButtonProps) {
  const t = useTranslations("pagination");

  return (
    <PaginationButton aria-label={t("previous")} {...props}>
      <ChevronLeft className="h-4 w-4" />
    </PaginationButton>
  );
}

export function PaginationNext(props: IconPaginationButtonProps) {
  const t = useTranslations("pagination");

  return (
    <PaginationButton aria-label={t("next")} {...props}>
      <ChevronRight className="h-4 w-4" />
    </PaginationButton>
  );
}

export function PaginationFirst(props: IconPaginationButtonProps) {
  const t = useTranslations("pagination");

  return (
    <PaginationButton aria-label={t("first")} {...props}>
      <ChevronsLeft className="h-4 w-4" />
    </PaginationButton>
  );
}

export function PaginationLast(props: IconPaginationButtonProps) {
  const t = useTranslations("pagination");

  return (
    <PaginationButton aria-label={t("last")} {...props}>
      <ChevronsRight className="h-4 w-4" />
    </PaginationButton>
  );
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 min-w-9 items-center justify-center text-xs font-black text-slate-400",
        className,
      )}
      {...props}
    >
      ...
    </span>
  );
}
