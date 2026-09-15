"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { getOrders } from "@/lib/actions";
import { Order } from "@/lib/data";
import { CircleDollarSign, Clock3, FileText, ReceiptText } from "lucide-react";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function InvoicesPage() {
  const t = useTranslations("pages.invoices");
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

  const invoices = orders.map((order) => ({
    id: `INV-${order.id.replace("ORD-", "")}`,
    order,
    status: order.paymentStatus === "PAID" ? "Paid" : "Pending",
  }));

  const summary = useMemo(() => {
    const paidAmount = orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingAmount = orders
      .filter((order) => order.paymentStatus !== "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return { paidAmount, pendingAmount };
  }, [orders]);

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <main className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/70 sm:p-6 lg:p-8">
        <section>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            <ReceiptText className="h-3.5 w-3.5" />
            {t("title")}
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon={FileText}
            label="Invoices"
            value={`${invoices.length}`}
            detail="เอกสารทั้งหมด"
          />
          <MetricCard
            icon={CircleDollarSign}
            label="Paid amount"
            value={money.format(summary.paidAmount)}
            detail="ชำระแล้ว"
          />
          <MetricCard
            icon={Clock3}
            label="Pending amount"
            value={money.format(summary.pendingAmount)}
            detail="รอชำระ/คืนเงิน"
          />
        </section>

        <Card>
          <CardHeader
            title="Invoice list"
            subtitle="เอกสารผูกกับคำสั่งซื้อในระบบ"
            icon={ReceiptText}
          />
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400 dark:border-slate-800">
                    <th className="px-1 py-3 font-black">Invoice</th>
                    <th className="px-4 py-3 font-black">Order</th>
                    <th className="px-4 py-3 font-black">Customer</th>
                    <th className="px-4 py-3 font-black">Status</th>
                    <th className="px-1 py-3 text-right font-black">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-1 py-4 font-mono font-black text-slate-900 dark:text-white">
                        {invoice.id}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold text-slate-500">
                        {invoice.order.id}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300">
                        {invoice.order.customerName}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-1 py-4 text-right font-black text-slate-900 dark:text-white">
                        {money.format(invoice.order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="ไม่พบ invoice"
              detail="ลองค้นหาด้วยหมายเลข order หรือชื่อลูกค้าอื่น"
            />
          )}
        </Card>
      </main>
    </div>
  );
}
