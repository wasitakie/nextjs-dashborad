import { ComponentType, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({
  icon: Icon,
  title,
  detail,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
      <Icon className="mb-3 h-8 w-8 text-slate-300" />
      <div className="text-sm font-black text-slate-700 dark:text-slate-200">
        {title}
      </div>
      <div className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {detail}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <Card className="h-36">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-6 h-8 w-72 max-w-full" />
          <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-36">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-6 h-8 w-32" />
              <Skeleton className="mt-5 h-3 w-full" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="h-96 xl:col-span-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-52 max-w-full" />
            <div className="mt-8 flex h-64 items-end gap-3">
              {[90, 140, 116, 190, 150, 220, 174].map((height, index) => (
                <Skeleton
                  key={`${height}-${index}`}
                  className="flex-1 rounded-t-xl"
                  style={{ height }}
                />
              ))}
            </div>
          </Card>
          <Card className="h-96">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-44 max-w-full" />
            <div className="flex h-64 items-center justify-center">
              <Skeleton className="h-44 w-44 rounded-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
