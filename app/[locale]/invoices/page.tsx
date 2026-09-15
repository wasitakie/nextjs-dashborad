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
    const invoiceTrendByDate = orders.reduce<Record<string, number>>(
      (acc, order) => {
        const dateKey = order.createdAt.slice(0, 10);
        acc[dateKey] = (acc[dateKey] ?? 0) + order.totalAmount;
        return acc;
      },
      {},
    );
    const dateLabel = new Intl.DateTimeFormat("th-TH", {
      month: "short",
      day: "numeric",
    });
    const invoiceTrend = Object.entries(invoiceTrendByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => ({
        date: dateLabel.format(new Date(date)),
        revenue: value,
      }));

    return { paidAmount, pendingAmount, invoiceTrend };
  }, [orders]);

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <SalesPage>
        <div className="space-y-6">
          <SalesHero
            badge={t("title")}
            icon={ReceiptText}
            title={t("title")}
            subtitle={t("subtitle")}
            metric={
              <HeroMetric
                label="Paid amount"
                value={money.format(summary.paidAmount)}
                detail={`${invoices.length} invoices · ${money.format(
                  summary.pendingAmount,
                )} pending`}
              />
            }
          />

          {isLoading ? (
            <DashboardLoadingState />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SalesMetric
                  icon={FileText}
                  label="Invoices"
                  value={`${invoices.length}`}
                  detail="เอกสารทั้งหมด"
                />
                <SalesMetric
                  icon={CircleDollarSign}
                  label="Paid amount"
                  value={money.format(summary.paidAmount)}
                  detail="ชำระแล้ว"
                />
                <SalesMetric
                  icon={Clock3}
                  label="Pending amount"
                  value={money.format(summary.pendingAmount)}
                  detail="รอชำระ/คืนเงิน"
                />
              </section>

              <ChartPanel
                title="Invoice Amount Trend"
                subtitle="มูลค่าเอกสารตามวันที่สร้าง order"
                icon={CircleDollarSign}
              >
                <SalesTrendChart data={summary.invoiceTrend} />
              </ChartPanel>

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
                          <th className="px-1 py-3 text-right font-black">
                            Amount
                          </th>
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
            </>
          )}
        </div>
      </SalesPage>
    </div>
  );
}
