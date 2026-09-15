import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoadingState() {
  return (
    <div className="space-y-5" aria-label="กำลังโหลด Dashboard">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-36">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-6 h-8 w-32" />
              </div>
              <Skeleton className="h-11 w-11 rounded-2xl" />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="h-96 xl:col-span-2">
          <PanelHeaderSkeleton />
          <ChartSkeleton />
        </Card>
        <Card className="h-96">
          <PanelHeaderSkeleton />
          <div className="flex h-64 items-center justify-center">
            <Skeleton className="h-44 w-44 rounded-full" />
          </div>
        </Card>
      </section>

      <Card>
        <PanelHeaderSkeleton />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.6fr_1fr_1fr_0.7fr_32px] items-center gap-4 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 dark:border-slate-800"
            >
              <div>
                <Skeleton className="h-4 w-44 max-w-full" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-28 max-w-full" />
              <Skeleton className="h-4 w-24 max-w-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PanelHeaderSkeleton() {
  return (
    <div className="mb-5">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-2 h-3 w-52 max-w-full" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-end gap-3">
      {[64, 96, 144, 112, 184, 132, 210, 156].map((height, index) => (
        <Skeleton
          key={`${height}-${index}`}
          className="flex-1 rounded-t-xl"
          style={{ height }}
        />
      ))}
    </div>
  );
}
