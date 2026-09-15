"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { getProducts, updateProductStock } from "@/lib/actions";
import { Product, ProductStatus } from "@/lib/data";
import {
  AlertCircle,
  Boxes,
  CircleDollarSign,
  Download,
  Layers3,
  Minus,
  PackagePlus,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table-pagination";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const statusStyle: Record<ProductStatus, string> = {
  IN_STOCK:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  LOW_STOCK:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  OUT_OF_STOCK:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
};

const PRODUCTS_PER_PAGE = 5;
const CSV_BOM = "\uFEFF";

function sanitizeCsvCell(value: string | number | undefined) {
  const cell = String(value ?? "");
  const safeCell = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
  return `"${safeCell.replace(/"/g, '""')}"`;
}

function buildProductsCsv(
  products: Product[],
  labels: {
    headers: string[];
    statuses: Record<ProductStatus, string>;
  },
) {
  const rows = products.map((product) => [
    product.id,
    product.sku,
    product.name,
    product.category,
    labels.statuses[product.status],
    product.price,
    product.originalPrice,
    product.stock,
    product.price * product.stock,
    product.salesCount,
    product.createdAt,
    product.description,
    product.image,
  ]);

  return [labels.headers, ...rows]
    .map((row) => row.map(sanitizeCsvCell).join(","))
    .join("\r\n");
}

export default function ProductsPage() {
  const t = useTranslations("pages.products");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status.product");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async () => {
    const rows = await getProducts({ search, category, status });
    setProducts(rows);
  }, [category, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).sort(
        (a, b) => a.localeCompare(b, "th"),
      ),
    [products],
  );

  const summary = useMemo(() => {
    const totalUnits = products.reduce(
      (sum, product) => sum + product.stock,
      0,
    );
    const totalValue = products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0,
    );
    const lowStock = products.filter(
      (product) => product.status === "LOW_STOCK",
    ).length;
    const outOfStock = products.filter(
      (product) => product.status === "OUT_OF_STOCK",
    ).length;
    const salesCount = products.reduce(
      (sum, product) => sum + product.salesCount,
      0,
    );

    return { totalUnits, totalValue, lowStock, outOfStock, salesCount };
  }, [products]);

  const pageCount = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, products]);
  const firstProductIndex =
    products.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const lastProductIndex = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    products.length,
  );

  async function adjustStock(product: Product, delta: number) {
    await updateProductStock(product.id, Math.max(0, product.stock + delta));
    loadProducts();
  }

  async function setExactStock(product: Product, value: string) {
    const nextStock = Number(value);
    if (Number.isNaN(nextStock) || nextStock < 0) return;
    await updateProductStock(product.id, Math.floor(nextStock));
    loadProducts();
  }

  function exportProductsCsv() {
    const csv = `${CSV_BOM}${buildProductsCsv(products, {
      headers: [
        "Product ID",
        "SKU",
        t("product"),
        t("category"),
        t("status"),
        t("price"),
        "Original price",
        t("stock"),
        t("inventoryValue"),
        t("sold"),
        "Created at",
        "Description",
        "Image",
      ],
      statuses: {
        IN_STOCK: tStatus("IN_STOCK"),
        LOW_STOCK: tStatus("LOW_STOCK"),
        OUT_OF_STOCK: tStatus("OUT_OF_STOCK"),
      },
    })}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `ecomflow-products-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder={t("search")}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <Boxes className="h-3.5 w-3.5" />
              {t("badge")}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <FilterSelect
              label="หมวดหมู่"
              value={category}
              onChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <option value="all">{t("allCategories")}</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="สถานะ"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="IN_STOCK">{tStatus("IN_STOCK")}</option>
              <option value="LOW_STOCK">{tStatus("LOW_STOCK")}</option>
              <option value="OUT_OF_STOCK">{tStatus("OUT_OF_STOCK")}</option>
            </FilterSelect>
            <ButtonLink href="/addproduct" icon={PackagePlus} variant="primary">
              {t("addProduct")}
            </ButtonLink>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric
            icon={Layers3}
            label={t("skuCount")}
            value={`${products.length}`}
            detail={t("shownItems")}
          />
          <Metric
            icon={Boxes}
            label={t("unitsOnHand")}
            value={`${summary.totalUnits}`}
            detail={t("allProducts")}
          />
          <Metric
            icon={CircleDollarSign}
            label={t("inventoryValue")}
            value={money.format(summary.totalValue)}
            detail={t("salePrice")}
          />
          <Metric
            icon={AlertCircle}
            label={t("reorderNeeded")}
            value={`${summary.lowStock + summary.outOfStock}`}
            detail={t("lowOutDetail", {
              low: summary.lowStock,
              out: summary.outOfStock,
            })}
          />
          <Metric
            icon={TrendingUp}
            label={t("totalSales")}
            value={`${summary.salesCount}`}
            detail={t("soldUnits")}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 ">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {t("tableTitle")}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {t("tableSubtitle")}
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder={t("localSearch")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-950"
                />
              </div>
              <div>
                <Button
                  disabled={products.length === 0}
                  onClick={exportProductsCsv}
                  variant="secondary"
                >
                  <Download className="h-4 w-4" />
                  {tCommon("export")}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-400 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-4 py-3 font-black">{t("product")}</th>
                    <th className="px-4 py-3 font-black">{t("category")}</th>
                    <th className="px-4 py-3 text-right font-black">{t("price")}</th>
                    <th className="px-4 py-3 text-center font-black">{t("status")}</th>
                    <th className="px-4 py-3 text-center font-black">{t("stock")}</th>
                    <th className="px-4 py-3 text-right font-black">{t("sold")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="bg-white align-middle transition hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div className="min-w-0">
                            <div className="max-w-[320px] truncate font-black text-slate-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="mt-1 font-mono text-[11px] font-semibold text-slate-400">
                              {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-slate-800 dark:text-slate-100">
                        {money.format(product.price)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${statusStyle[product.status]}`}
                        >
                          {tStatus(product.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => adjustStock(product, -1)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            title={t("decreaseStock")}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(event) =>
                              setExactStock(product, event.target.value)
                            }
                            className="h-8 w-16 rounded-lg border border-slate-200 bg-white text-center text-xs font-black text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                          />
                          <button
                            type="button"
                            onClick={() => adjustStock(product, 1)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            title={t("increaseStock")}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-500">
                        {product.salesCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="flex h-60 flex-col items-center justify-center text-center">
                  <PackagePlus className="mb-3 h-8 w-8 text-slate-300" />
                  <div className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {t("emptyTitle")}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {t("emptyDetail")}
                  </div>
                </div>
              )}
            </div>

            {products.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                pageCount={pageCount}
                from={firstProductIndex}
                to={lastProductIndex}
                total={products.length}
                onPageChange={setPage}
              />
            )}
          </div>

          {/* <form
            onSubmit={handleCreateProduct}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  เพิ่มสินค้าใหม่
                </h2>
                <p className="text-xs text-slate-400">
                  ข้อมูลจะถูกเพิ่มใน mock inventory ระหว่างใช้งาน
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <TextField
                label="ชื่อสินค้า"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
                required
              />
              <TextField
                label="SKU"
                value={form.sku}
                onChange={(value) => setForm({ ...form, sku: value })}
                required
              />
              <TextField
                label="หมวดหมู่"
                value={form.category}
                onChange={(value) => setForm({ ...form, category: value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="ราคาขาย"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(value) => setForm({ ...form, price: value })}
                  required
                />
                <TextField
                  label="ราคาเดิม"
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(value) =>
                    setForm({ ...form, originalPrice: value })
                  }
                />
              </div>

              <TextField
                label="จำนวนเริ่มต้น"
                type="number"
                min="0"
                value={form.stock}
                onChange={(value) => setForm({ ...form, stock: value })}
                required
              />
              <TextField
                label="รูปสินค้า URL"
                value={form.image}
                onChange={(value) => setForm({ ...form, image: value })}
              />

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-black text-slate-500">
                  รายละเอียดสินค้า
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-950"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isSaving ? (
                <SlidersHorizontal className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              บันทึกสินค้า
            </button>
          </form> */}
        </section>
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
        <span className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
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

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
      <span className="text-[11px] font-black text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-xs font-bold text-slate-700 outline-none dark:text-slate-100"
      >
        {children}
      </select>
    </label>
  );
}
