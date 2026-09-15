"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardLoadingState } from "@/components/dashboard-loading-state";
import { Header } from "@/components/header";
import { Link } from "@/i18n/navigation";
import {
  getConversations,
  getOrders,
  getProducts,
  getUnreadCount,
} from "@/lib/actions";
import { Conversation, Order, Product } from "@/lib/data";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  PackageCheck,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type ActivityRow = {
  id: string;
  title: string;
  source: string;
  status: string;
  owner: string;
  href: string;
};

export default function OverviewPage() {
  const t = useTranslations("pages.overview");
  const tCommon = useTranslations("common");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        orderRows,
        productRows,
        conversationRows,
        unread,
      ] = await Promise.all([
        getOrders({ search }),
        getProducts({ search }),
        getConversations({ search }),
        getUnreadCount(),
      ]);

      setOrders(orderRows);
      setProducts(productRows);
      setConversations(conversationRows);
      setUnreadCount(unread);
    } catch {
      setError("โหลดข้อมูล dashboard ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const dashboard = useMemo(() => {
    const paidRevenue = orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const stockValue = products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0,
    );
    const lowStock = products.filter(
      (product) => product.status === "LOW_STOCK",
    ).length;
    const outOfStock = products.filter(
      (product) => product.status === "OUT_OF_STOCK",
    ).length;
    const openChats = conversations.filter(
      (conversation) => conversation.status === "OPEN",
    ).length;

    const categoryValue = Object.entries(
      products.reduce<Record<string, number>>((acc, product) => {
        acc[product.category] =
          (acc[product.category] ?? 0) + product.stock * product.price;
        return acc;
      }, {}),
    ).map(([category, value]) => ({ category, value }));

    const orderStatusMix = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ].map((status) => ({
      name: status,
      value: orders.filter((order) => order.orderStatus === status).length,
    }));

    const paymentMix = ["PAID", "PENDING", "REFUNDED"].map((status) => ({
      name: status,
      value: orders.filter((order) => order.paymentStatus === status).length,
    }));

    const stockRisk = [
      {
        name: "พร้อมขาย",
        value: products.filter((p) => p.status === "IN_STOCK").length,
      },
      { name: "ใกล้หมด", value: lowStock },
      { name: "หมดสต็อก", value: outOfStock },
    ].filter((item) => item.value > 0);

    const recentActivity: ActivityRow[] = [
      ...orders.slice(0, 5).map((order) => ({
        id: order.id,
        title: `Order ${order.id} - ${money.format(order.totalAmount)}`,
        source: order.customerName,
        status: order.orderStatus,
        owner: order.paymentMethod,
        href: "/analytics",
      })),
      ...conversations.slice(0, 3).map((conversation) => ({
        id: conversation.id,
        title: conversation.subject,
        source: conversation.customer?.name ?? "ลูกค้า",
        status: conversation.status,
        owner: conversation.orderRef ?? "No order",
        href: "/chat",
      })),
      ...products
        .filter(
          (product) =>
            product.status === "LOW_STOCK" ||
            product.status === "OUT_OF_STOCK",
        )
        .slice(0, 2)
        .map((product) => ({
          id: product.id,
          title: `${product.name} stock alert`,
          source: product.category,
          status: product.status.replace("_", " "),
          owner: `${product.stock} units`,
          href: "/stocks",
        })),
    ].slice(0, 8);

    return {
      paidRevenue,
      stockValue,
      lowStock,
      outOfStock,
      openChats,
      statusMix: [],
      categoryValue,
      orderStatusMix,
      paymentMix,
      priorityWorkload: [],
      stockRisk,
      recentActivity,
    };
  }, [conversations, orders, products]);

  const modeStats = useMemo(() => {
    const paidOrders = orders.filter(
      (order) => order.paymentStatus === "PAID",
    ).length;

    return [
      {
        icon: Wallet,
        label: "Paid revenue",
        value: money.format(dashboard.paidRevenue),
        detail: `${paidOrders} paid orders`,
        trend: "+8.1%",
      },
      {
        icon: PackageCheck,
        label: "Orders tracked",
        value: `${orders.length}`,
        detail: `${dashboard.openChats} open chats`,
        trend: "Live",
      },
      {
        icon: Bell,
        label: "Unread alerts",
        value: `${unreadCount}`,
        detail: "customer messages",
        trend: unreadCount > 0 ? "Action" : "Clear",
      },
      {
        icon: CheckCircle2,
        label: "Delivered",
        value: `${orders.filter((o) => o.orderStatus === "DELIVERED").length}`,
        detail: "completed shipments",
        trend: "Ops",
      },
    ];
  }, [dashboard, orders, unreadCount]);

  return (
    <div className="flex h-screen flex-col">
      <Header
        onSearchChange={setSearch}
        placeholder={t("search")}
      />

      <main className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/70 sm:p-6 lg:p-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              {t("badge")}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-[32px]">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-[11px] font-bold text-slate-400 sm:block">
              <div className="uppercase tracking-wider">Dashboard view</div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">
                EcomFlow
              </div>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {tCommon("refresh")}
            </button>
          </div>
        </section>

        {error && (
          <StatePanel
            tone="error"
            icon={AlertTriangle}
            title={tCommon("loadingErrorTitle")}
            detail={error}
          >
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white transition hover:bg-rose-700"
            >
              Retry
            </button>
          </StatePanel>
        )}

        {isLoading ? (
          <DashboardLoadingState />
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {modeStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </section>

            <DashboardCharts
              mode="ecommerce"
              dashboard={dashboard}
              velocity={[]}
            />

            <Panel
              title="Recent activity"
              subtitle="Task, order และ customer updates ล่าสุด"
            >
              {dashboard.recentActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400 dark:border-slate-800">
                        <th className="px-1 py-3 font-black">Activity</th>
                        <th className="px-4 py-3 font-black">Source</th>
                        <th className="px-4 py-3 font-black">Owner</th>
                        <th className="px-4 py-3 font-black">Status</th>
                        <th className="px-1 py-3 text-right font-black">
                          Open
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {dashboard.recentActivity.map((activity) => (
                        <tr
                          key={`${activity.id}-${activity.href}`}
                          className="group transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-1 py-4">
                            <div className="font-black text-slate-900 dark:text-white">
                              {activity.title}
                            </div>
                            <div className="mt-1 font-mono text-[11px] font-semibold text-slate-400">
                              {activity.id}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300">
                            {activity.source}
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-500">
                            {activity.owner}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-1 py-4 text-right">
                            <Link
                              href={activity.href}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition group-hover:bg-white group-hover:text-slate-900 dark:group-hover:bg-slate-900 dark:group-hover:text-white"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={Clock3}
                  title="ยังไม่มีกิจกรรมล่าสุด"
                  detail="เมื่อมี task, order หรือ chat ใหม่ ตารางนี้จะแสดงรายการทันที"
                />
              )}
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  trend: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 dark:hover:shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <h2 className="mt-3 truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {value}
          </h2>
        </div>
        <span className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="truncate text-[11px] font-semibold text-slate-400">
          {detail}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      </div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-950 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
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
    </div>
  );
}

function StatePanel({
  icon: Icon,
  title,
  detail,
  tone,
  children,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
  tone: "error";
  children?: React.ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
      : "";

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${toneClass}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5" />
        <div>
          <div className="text-sm font-black">{title}</div>
          <div className="mt-1 text-xs font-semibold opacity-80">{detail}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
