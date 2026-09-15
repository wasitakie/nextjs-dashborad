"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  Columns3,
  LayoutDashboard,
  ListChecks,
  Menu,
  MessageSquare,
  Package,
  PackagePlus,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  UserCircle,
  X,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { getUnreadCount } from "@/lib/actions";

type SidebarNavItem = {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  badge?: boolean;
};

const MenuItems = [
  { labelKey: "profile", href: "/profile", icon: UserCircle },
] satisfies SidebarNavItem[];

const dashboardNavigation = [
  { labelKey: "ecommerce", href: "/", icon: LayoutDashboard },
  { labelKey: "analytics", href: "/analytics", icon: BarChart3 },
  { labelKey: "taskSaas", href: "/tasks", icon: ListChecks },
  { labelKey: "stocks", href: "/stocks", icon: Boxes },
] satisfies SidebarNavItem[];

const taskNavigation = [
  { labelKey: "taskList", href: "/tasklist", icon: ListChecks },
  { labelKey: "taskKanban", href: "/taskkanban", icon: Columns3 },
] satisfies SidebarNavItem[];

const ecommerceNavigation = [
  { labelKey: "products", href: "/products", icon: Package },
  { labelKey: "orders", href: "/orders", icon: ShoppingBag },
  { labelKey: "addProduct", href: "/addproduct", icon: PackagePlus },
  { labelKey: "invoices", href: "/invoices", icon: ReceiptText },
] satisfies SidebarNavItem[];

const supportNavigation = [
  { labelKey: "chat", href: "/chat", icon: MessageSquare, badge: true },
] satisfies SidebarNavItem[];

export function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    getUnreadCount().then(setUnreadCount);
    const interval = setInterval(
      () => getUnreadCount().then(setUnreadCount),
      10000,
    );
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMobileOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-900/10 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 lg:hidden"
        title={t("openMenu")}
      >
        <Menu className="h-4 w-4" />
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-950/25 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95">
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900"
              title={t("closeMenu")}
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent pathname={pathname} unreadCount={unreadCount} />
          </aside>
        </div>
      )}

      <aside className="hidden h-screen w-64 flex-col border-r border-slate-200/80 bg-white/95 shadow-[8px_0_35px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-[8px_0_35px_rgba(0,0,0,0.22)] lg:sticky lg:top-0 lg:z-30 lg:flex">
        <SidebarContent pathname={pathname} unreadCount={unreadCount} />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  unreadCount,
}: {
  pathname: string;
  unreadCount: number;
}) {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-6 dark:border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-sm dark:bg-white dark:text-slate-950">
          <Sparkles className="h-4 w-4 animate-pulse text-indigo-400 dark:text-indigo-600" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none tracking-tight text-slate-900 dark:text-white">
            EcomFlow
          </h1>
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {tCommon("minimalAdmin")}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
        <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {tCommon("menu")}
        </div>
        <DropdownSection
          icon={LayoutDashboard}
          items={dashboardNavigation}
          pathname={pathname}
          title={tNav("dashboard")}
        />
        {MenuItems.map((item) => (
          <SidebarLink
            key={item.labelKey}
            item={item}
            pathname={pathname}
            unreadCount={unreadCount}
          />
        ))}

        <DropdownSection
          icon={ListChecks}
          items={taskNavigation}
          pathname={pathname}
          title={tNav("tasks")}
        />

        <DropdownSection
          icon={ShoppingBag}
          items={ecommerceNavigation}
          pathname={pathname}
          title={tNav("ecommerce")}
        />

        <nav className="space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {tCommon("support")}
          </div>
          {supportNavigation.map((item) => (
            <SidebarLink
              key={item.labelKey}
              item={item}
              pathname={pathname}
              unreadCount={unreadCount}
            />
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200/80 p-4 dark:border-slate-800/80">
        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-0.5 flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200">
            <span>{tCommon("systemReady")}</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            EcomFlow v2.0 - Minimalist UI
          </p>
        </div>
      </div>
    </>
  );
}

function DropdownSection({
  icon: Icon,
  items,
  pathname,
  title,
}: {
  icon: React.ElementType;
  items: SidebarNavItem[];
  pathname: string;
  title: string;
}) {
  const tNav = useTranslations("nav");
  const isActive = items.some((item) => item.href === pathname);
  const [isOpen, setIsOpen] = useState(isActive);
  const isExpanded = isActive || isOpen;

  return (
    <section className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`group flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-950 dark:shadow-black/30"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        }`}
        aria-expanded={isExpanded}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="truncate">{title}</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="ml-5 space-y-1 pl-2 dark:border-slate-800">
          {items.map((item) => {
            const activeItem = pathname === item.href;
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.labelKey}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all duration-200 ${
                  activeItem
                    ? "bg-teal-50 text-teal-700 shadow-sm dark:bg-teal-950/40 dark:text-teal-300"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{tNav(item.labelKey)}</span>
                </span>
                {activeItem && <ChevronRight className="h-3 w-3" />}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SidebarLink({
  item,
  pathname,
  unreadCount,
}: {
  item: SidebarNavItem;
  pathname: string;
  unreadCount: number;
}) {
  const tNav = useTranslations("nav");
  const isActive = pathname === item.href;
  const showBadge = item.badge && unreadCount > 0;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
        isActive
          ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-950 dark:shadow-black/30"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="relative shrink-0">
          <Icon
            className={`h-4 w-4 transition-transform duration-200 ${
              isActive ? "scale-110" : "group-hover:scale-110"
            }`}
          />
          {showBadge && !isActive && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
          )}
        </span>
        <span className="truncate">{tNav(item.labelKey)}</span>
      </span>
      <span className="flex items-center gap-1.5">
        {showBadge && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              isActive
                ? "bg-rose-500 text-white"
                : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
            }`}
          >
            {unreadCount}
          </span>
        )}
        {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
      </span>
    </Link>
  );
}
