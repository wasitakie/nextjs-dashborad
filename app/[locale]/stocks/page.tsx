"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  DashboardCharts,
  type DashboardChartsData,
} from "@/components/dashboard-charts";
import { DashboardLoadingState } from "@/components/dashboard-loading-state";
import { Header } from "@/components/header";
import {
  HeroMetric,
  SalesHero,
  SalesPage,
} from "@/components/sales-dashboard-ui";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { TablePagination } from "@/components/ui/table-pagination";
import { getProducts } from "@/lib/actions";
import { Product } from "@/lib/data";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const STOCKS_PER_PAGE = 5;

export default function StocksPage() {
  const t = useTranslations("pages.stocks");
  const tCommon = useTranslations("common");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rows = await getProducts({ search });
      setProducts(rows);
    } catch {
      setError(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const summary = useMemo(() => {
    const totalUnits = products.reduce(
      (sum, product) => sum + product.stock,
      0,
    );
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

    const categoryValue = Object.entries(
      products.reduce<Record<string, number>>((acc, product) => {
        acc[product.category] =
          (acc[product.category] ?? 0) + product.stock * product.price;
        return acc;
      }, {}),
    ).map(([category, value]) => ({ category, value }));

    const stockRisk = [
      {
        name: "พร้อมขาย",
        value: products.filter((product) => product.status === "IN_STOCK")
          .length,
      },
      { name: "ใกล้หมด", value: lowStock },
      { name: "หมดสต็อก", value: outOfStock },
    ].filter((item) => item.value > 0);

    return {
      totalUnits,
      stockValue,
      lowStock,
      outOfStock,
      categoryValue,
      stockRisk,
    };
  }, [products]);

  const chartData: DashboardChartsData = {
    statusMix: [],
    categoryValue: summary.categoryValue,
    orderStatusMix: [],
    paymentMix: [],
    priorityWorkload: [],
    stockRisk: summary.stockRisk,
  };

  const stockWatchlist = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === "LOW_STOCK" || product.status === "OUT_OF_STOCK",
      ),
    [products],
  );
  const pageCount = Math.max(
    1,
    Math.ceil(stockWatchlist.length / STOCKS_PER_PAGE),
  );
  const currentPage = Math.min(page, pageCount);
  const paginatedStockWatchlist = useMemo(() => {
    const start = (currentPage - 1) * STOCKS_PER_PAGE;
    return stockWatchlist.slice(start, start + STOCKS_PER_PAGE);
  }, [currentPage, stockWatchlist]);
  const firstStockIndex =
    stockWatchlist.length === 0 ? 0 : (currentPage - 1) * STOCKS_PER_PAGE + 1;
  const lastStockIndex = Math.min(
    currentPage * STOCKS_PER_PAGE,
    stockWatchlist.length,
  );

  return (
    <div className="flex h-screen flex-col">
      <Header
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder={t("search")}
      />

      <SalesPage>
        <div className="space-y-6">
        <SalesHero
          badge={t("badge")}
          icon={Sparkles}
          title={t("title")}
          subtitle={t("subtitle")}
          metric={
            <HeroMetric
              label={t("inventoryValue")}
              value={money.format(summary.stockValue)}
              detail={`${products.length} SKUs · ${summary.totalUnits} ${t(
                "units",
              )}`}
            />
          }
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void loadProducts()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {tCommon("refresh")}
          </button>
        </SalesHero>

        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                <div className="text-sm font-black">
                  {tCommon("loadingErrorTitle")}
                </div>
                <div className="mt-1 text-xs font-semibold opacity-80">
                  {error}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white transition hover:bg-rose-700"
            >
              {tCommon("retry")}
            </button>
          </div>
        )}

        {isLoading ? (
          <DashboardLoadingState />
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={CircleDollarSign}
                label={t("inventoryValue")}
                value={money.format(summary.stockValue)}
                detail={`${products.length} SKUs`}
              />
              <MetricCard
                icon={Boxes}
                label={t("unitsOnHand")}
                value={`${summary.totalUnits}`}
                detail={t("availableUnits")}
              />
              <MetricCard
                icon={AlertTriangle}
                label={t("lowStock")}
                value={`${summary.lowStock}`}
                detail={t("needsReorder")}
              />
              <MetricCard
                icon={PackageCheck}
                label={t("outOfStock")}
                value={`${summary.outOfStock}`}
                detail={t("cannotSell")}
              />
            </section>

            <DashboardCharts mode="stocks" dashboard={chartData} velocity={[]} />

            <Card>
              <CardHeader
                title={t("watchlistTitle")}
                subtitle={t("watchlistSubtitle")}
                icon={AlertTriangle}
              />
              {stockWatchlist.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400 dark:border-slate-800">
                        <th className="px-1 py-3 font-black">Product</th>
                        <th className="px-4 py-3 font-black">Category</th>
                        <th className="px-4 py-3 font-black">SKU</th>
                        <th className="px-4 py-3 font-black">Stock</th>
                        <th className="px-1 py-3 text-right font-black">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedStockWatchlist.map((product) => (
                        <tr
                          key={product.id}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-1 py-4">
                            <div className="font-black text-slate-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="mt-1 text-[11px] font-semibold text-slate-400">
                              {product.description}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300">
                            {product.category}
                          </td>
                          <td className="px-4 py-4 font-mono font-semibold text-slate-500">
                            {product.sku}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              {product.stock} {t("units")}
                            </span>
                          </td>
                          <td className="px-1 py-4 text-right font-black text-slate-900 dark:text-white">
                            {money.format(product.stock * product.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <TablePagination
                    currentPage={currentPage}
                    pageCount={pageCount}
                    from={firstStockIndex}
                    to={lastStockIndex}
                    total={stockWatchlist.length}
                    itemLabel={t("products")}
                    onPageChange={setPage}
                  />
                </div>
              ) : (
                <EmptyState
                  icon={PackageCheck}
                  title={t("noRiskTitle")}
                  detail={t("noRiskDetail")}
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
