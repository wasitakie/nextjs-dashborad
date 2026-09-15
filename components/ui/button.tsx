import { ComponentType, ReactNode } from "react";

import { Link } from "@/i18n/navigation";

type ButtonProps = {
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses = {
  primary:
    "bg-teal-600 text-white shadow-teal-900/10 hover:bg-teal-700 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

export function Button({
  children,
  icon: Icon,
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  icon: Icon,
  variant = "secondary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  variant?: keyof typeof variantClasses;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 hover:shadow-md ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}
