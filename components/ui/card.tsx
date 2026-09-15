import { ComponentType, ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-black text-slate-950 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
        )}
      </div>
      {Icon && (
        <span className="rounded-2xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70 dark:hover:shadow-black/30">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="rounded-2xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="truncate text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-slate-400">
        {detail}
      </div>
    </Card>
  );
}
