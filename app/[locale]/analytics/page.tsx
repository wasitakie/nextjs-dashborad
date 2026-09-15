"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChartPanel,
  MultiBarChart,
  SalesTrendChart,
  StatusPie,
  ValuePieChart,
} from "@/components/dashboard-charts";
import { Header } from "@/components/header";
import { getOrders, getProducts } from "@/lib/actions";
import { Order, OrderStatus, Product } from "@/lib/data";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function AnalyticsPage() {
  const t = useTranslations("pages.analytics");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [orderRows, productRows] = await Promise.all([
      getOrders({ search }),
      getProducts({ search }),
    ]);
    setOrders(orderRows);
    setProducts(productRows);
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const analytics = useMemo(() => {
    const paidOrders = orders.filter((order) => order.paymentStatus === "PAID");
    const stockValue = products.reduce(
      (sum, product) => sum + product.stock * product.price,
      0,
    );
    const revenue = paidOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const averageOrderValue =
      paidOrders.length > 0 ? Math.round(revenue / paidOrders.length) : 0;
    const deliveredOrders = orders.filter(
      (order) => order.orderStatus === "DELIVERED",
    ).length;

    const orderStatusMix = (Object.keys(orderStatusLabel) as OrderStatus[])
      .map((status) => ({
        name: orderStatusLabel[status],
        value: orders.filter((order) => order.orderStatus === status).length,
      }))
      .filter((item) => item.value > 0);

    const salesByDate = paidOrders.reduce<Record<string, number>>(
      (acc, order) => {
        const dateKey = order.createdAt.slice(0, 10);
        acc[dateKey] = (acc[dateKey] ?? 0) + order.totalAmount;
        return acc;
      },
      {},
    );

    const inventoryByCategory = products.reduce<Record<string, number>>(
      (acc, product) => {
        acc[product.category] =
          (acc[product.category] ?? 0) + product.stock * product.price;
        return acc;
      },
      {},
    );

    const dateLabel = new Intl.DateTimeFormat("th-TH", {
      month: "short",
      day: "numeric",
    });

    return {
      orderCount: orders.length,
      paidOrderCount: paidOrders.length,
      deliveredOrders,
      stockValue,
      revenue,
      averageOrderValue,
      orderStatusMix,
      salesTrend: Object.entries(salesByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, revenue]) => ({
          date: dateLabel.format(new Date(date)),
          revenue,
        })),
      inventoryChart: Object.entries(inventoryByCategory).map(
        ([name, value]) => ({ name, value }),
      ),
      topProducts: [...products]
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5),
    };
  }, [orders, products]);

  const isEmpty = !isLoading && orders.length === 0 && products.length === 0;

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <div className="premium-page">
        <div className="space-y-6">
          <section className="rounded-2xl border border-teal-100 bg-white/90 p-5 shadow-sm dark:border-teal-900/50 dark:bg-slate-900">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              <BarChart3 className="h-3.5 w-3.5" />
              {t("badge")}
            </p>
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  {t("title")}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {t("subtitle")}
                </p>
              </div>
              <HeroMetric
                label="Paid revenue"
                value={money.format(analytics.revenue)}
                detail={`${analytics.paidOrderCount} paid orders · AOV ${money.format(
                  analytics.averageOrderValue,
                )}`}
              />
            </div>
          </section>

          {isLoading ? (
            <AnalyticsLoadingState />
          ) : isEmpty ? (
            <AnalyticsEmptyState search={search} />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  icon={ReceiptText}
                  label="Orders"
                  value={`${analytics.orderCount}`}
                  detail="คำสั่งซื้อทั้งหมด"
                />
                <Metric
                  icon={TrendingUp}
                  label="AOV"
                  value={money.format(analytics.averageOrderValue)}
                  detail="มูลค่าเฉลี่ยต่อคำสั่งซื้อ"
                />
                <Metric
                  icon={ShoppingBag}
                  label="Delivered"
                  value={`${analytics.deliveredOrders}`}
                  detail="จัดส่งสำเร็จแล้ว"
                />
                <Metric
                  icon={Boxes}
                  label="Inventory value"
                  value={money.format(analytics.stockValue)}
                  detail="มูลค่าสินค้าคงคลัง"
                />
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <ChartPanel
                  title="Sales Trend"
                  subtitle="แนวโน้มยอดขายจาก order ที่ชำระแล้ว"
                  className="xl:col-span-2"
                  icon={CircleDollarSign}
                >
                  <SalesTrendChart data={analytics.salesTrend} />
                </ChartPanel>

                <ChartPanel
                  title="Order Status Mix"
                  subtitle="สัดส่วนคำสั่งซื้อตามสถานะ"
                >
                  <StatusPie data={analytics.orderStatusMix} />
                </ChartPanel>

                <ChartPanel
                  title="Inventory by Category"
                  subtitle="มูลค่าสต็อกแยกตามหมวดสินค้า"
                  className="xl:col-span-2"
                >
                  <MultiBarChart
                    data={analytics.inventoryChart}
                    bars={[{ dataKey: "value", fill: "#0f766e" }]}
                  />
                </ChartPanel>

                <ChartPanel
                  title="Inventory Value"
                  subtitle="มูลค่าสต็อกตามหมวดหมู่"
                  icon={Boxes}
                >
                  <ValuePieChart
                    data={analytics.inventoryChart}
                    formatter={(value) => money.format(value)}
                  />
                </ChartPanel>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-3">
                  <div className="mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">
                      Top product snapshot
                    </h2>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analytics.topProducts.map((product) => (
                      <div
                        key={product.id}
                        className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_140px_140px] md:items-center"
                      >
                        <div>
                          <div className="text-sm font-black text-slate-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-400">
                            {product.category} · SKU {product.sku}
                          </div>
                        </div>
                        <div className="text-xs font-black text-slate-600 dark:text-slate-300">
                          Sold {product.salesCount}
                        </div>
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-800">
                            Stock {product.stock}
                          </span>
                          <span className="text-xs font-black text-teal-700 dark:text-teal-300">
                            {money.format(product.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4 dark:border-teal-900/60 dark:bg-teal-950/20">
      <div className="text-xs font-black uppercase text-teal-700 dark:text-teal-300">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {detail}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="rounded-xl bg-teal-50 p-2 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="truncate text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-slate-400">
        {detail}
      </div>
    </div>
  );
}

function AnalyticsLoadingState() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-6 h-8 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-3 w-44 max-w-full rounded-full bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="mt-8 h-64 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-4 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="mx-auto mt-12 h-44 w-44 rounded-full bg-slate-100 dark:bg-slate-800/70" />
        </div>
      </section>
    </div>
  );
}

function AnalyticsEmptyState({ search }: { search: string }) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center dark:border-slate-800 dark:bg-slate-900/70">
      <PackageSearch className="mb-4 h-10 w-10 text-teal-500" />
      <h2 className="text-base font-black text-slate-950 dark:text-white">
        ไม่พบข้อมูลสำหรับวิเคราะห์
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {search
          ? "ลองปรับคำค้นหรือเคลียร์ตัวกรอง เพื่อให้ระบบแสดงยอดขายและสถานะคำสั่งซื้ออีกครั้ง"
          : "เมื่อมี order หรือสินค้าในระบบ หน้านี้จะแสดง metric และกราฟให้อัตโนมัติ"}
      </p>
    </div>
  );
}
