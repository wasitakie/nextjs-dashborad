import { ComponentType, ReactNode } from "react";

export function SalesPage({
  children,
}: {
  children: ReactNode;
}) {
  return <main className="premium-page">{children}</main>;
}

export function SalesHero({
  badge,
  children,
  icon: Icon,
  metric,
  subtitle,
  title,
}: {
  badge: string;
  children?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  metric?: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-teal-100 bg-white/90 p-5 shadow-sm dark:border-teal-900/50 dark:bg-slate-900">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
        <Icon className="h-3.5 w-3.5" />
        {badge}
      </p>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
          {children && <div className="mt-4">{children}</div>}
        </div>
        {metric}
      </div>
    </section>
  );
}

export function HeroMetric({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-teal-100 bg-teal-50/70 p-4 dark:border-teal-900/60 dark:bg-teal-950/20">
      <div className="text-xs font-black uppercase text-teal-700 dark:text-teal-300">
        {label}
      </div>
      <div className="mt-2 truncate text-3xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {detail}
      </div>
    </div>
  );
}

export function SalesMetric({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="rounded-lg bg-teal-50 p-2 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="truncate text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-slate-400">
        {detail}
      </div>
    </article>
  );
}
