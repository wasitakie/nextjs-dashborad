"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
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

  const loadOrders = useCallback(async () => {
    const rows = await getOrders({ search });
    setOrders(rows);
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

    return { revenue, paid, pending, delivered };
  }, [orders]);

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <main className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/70 sm:p-6 lg:p-8">
        <section>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("title")}
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={CreditCard}
            label="Paid revenue"
            value={money.format(summary.revenue)}
            detail={`${summary.paid} paid orders`}
          />
          <MetricCard
            icon={ShoppingBag}
            label="Orders"
            value={`${orders.length}`}
            detail="รายการที่แสดงอยู่"
          />
          <MetricCard
            icon={Clock3}
            label="Pending"
            value={`${summary.pending}`}
            detail="รอ processing"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Delivered"
            value={`${summary.delivered}`}
            detail="ส่งสำเร็จแล้ว"
          />
        </section>

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
                    <th className="px-1 py-3 text-right font-black">Total</th>
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
      </main>
    </div>
  );
}
