"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChartPanel, SalesTrendChart } from "@/components/dashboard-charts";
import { DashboardLoadingState } from "@/components/dashboard-loading-state";
import { Header } from "@/components/header";
import {
  HeroMetric,
  SalesHero,
  SalesMetric,
  SalesPage,
} from "@/components/sales-dashboard-ui";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { getOrders } from "@/lib/actions";
import { Order } from "@/lib/data";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function OrdersPage() {
  const t = useTranslations("pages.orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    const rows = await getOrders({ search });
    setOrders(rows);
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const summary = useMemo(() => {
    const revenue = orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const paid = orders.filter((order) => order.paymentStatus === "PAID").length;
    const pending = orders.filter(
      (order) => order.orderStatus === "PENDING",
    ).length;
    const delivered = orders.filter(
      (order) => order.orderStatus === "DELIVERED",
    ).length;
    const salesByDate = orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce<Record<string, number>>((acc, order) => {
        const dateKey = order.createdAt.slice(0, 10);
        acc[dateKey] = (acc[dateKey] ?? 0) + order.totalAmount;
        return acc;
      }, {});
    const dateLabel = new Intl.DateTimeFormat("th-TH", {
      month: "short",
      day: "numeric",
    });
    const salesTrend = Object.entries(salesByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => ({
        date: dateLabel.format(new Date(date)),
        revenue: value,
      }));

    return { revenue, paid, pending, delivered, salesTrend };
  }, [orders]);

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <SalesPage>
        <div className="space-y-6">
          <SalesHero
            badge={t("title")}
            icon={ShoppingBag}
            title={t("title")}
            subtitle={t("subtitle")}
            metric={
              <HeroMetric
                label="Paid revenue"
                value={money.format(summary.revenue)}
                detail={`${summary.paid} paid orders · ${orders.length} total`}
              />
            }
          />

          {isLoading ? (
            <DashboardLoadingState />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SalesMetric
                  icon={CreditCard}
                  label="Paid revenue"
                  value={money.format(summary.revenue)}
                  detail={`${summary.paid} paid orders`}
                />
                <SalesMetric
                  icon={ShoppingBag}
                  label="Orders"
                  value={`${orders.length}`}
                  detail="รายการที่แสดงอยู่"
                />
                <SalesMetric
                  icon={Clock3}
                  label="Pending"
                  value={`${summary.pending}`}
                  detail="รอ processing"
                />
                <SalesMetric
                  icon={CheckCircle2}
                  label="Delivered"
                  value={`${summary.delivered}`}
                  detail="ส่งสำเร็จแล้ว"
                />
              </section>

              <ChartPanel
                title="Sales Trend"
                subtitle="ยอดขายจากคำสั่งซื้อที่ชำระแล้ว"
                icon={CreditCard}
              >
                <SalesTrendChart data={summary.salesTrend} />
              </ChartPanel>

              <Card>
                <CardHeader
                  title="Recent orders"
                  subtitle="รายการคำสั่งซื้อล่าสุด"
                  icon={PackageCheck}
                />
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400 dark:border-slate-800">
                          <th className="px-1 py-3 font-black">Order</th>
                          <th className="px-4 py-3 font-black">Customer</th>
                          <th className="px-4 py-3 font-black">Payment</th>
                          <th className="px-4 py-3 font-black">Status</th>
                          <th className="px-1 py-3 text-right font-black">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {orders.map((order) => (
                          <tr
                            key={order.id}
                            className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-1 py-4 font-mono font-black text-slate-900 dark:text-white">
                              {order.id}
                            </td>
                            <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300">
                              {order.customerName}
                            </td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="px-1 py-4 text-right font-black text-slate-900 dark:text-white">
                              {money.format(order.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={ShoppingBag}
                    title="ไม่พบคำสั่งซื้อ"
                    detail="ลองค้นหาด้วยชื่อลูกค้าหรือหมายเลข order อื่น"
                  />
                )}
              </Card>
            </>
          )}
        </div>
      </SalesPage>
    </div>
  );
}
