"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader } from "@/components/ui/card";
import { createProduct } from "@/lib/actions";
import { CheckCircle2, PackagePlus, Sparkles } from "lucide-react";

const emptyForm = {
  name: "",
  sku: "",
  price: "",
  originalPrice: "",
  stock: "",
  category: "",
  image: "",
  description: "",
};

export default function AddProductPage() {
  const t = useTranslations("pages.addproduct");
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    await createProduct({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      price: Number(form.price),
      originalPrice: form.originalPrice
        ? Number(form.originalPrice)
        : undefined,
      stock: Number(form.stock),
      category: form.category.trim(),
      image: form.image.trim(),
      description: form.description.trim(),
    });

    setForm(emptyForm);
    setIsSaving(false);
    setIsSaved(true);
  }

  return (
    <div className="flex h-screen flex-col">
      <Header placeholder={t("search")} />

      <main className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/70 sm:p-6 lg:p-8">
        <section>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            <Sparkles className="h-3.5 w-3.5" />
            {t("title")}
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </section>

        {isSaved && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            เพิ่มสินค้าใหม่เรียบร้อยแล้ว
          </div>
        )}

        <Card className="max-w-4xl dark:bg-slate-900">
          <CardHeader
            title={t("productDetails")}
            subtitle="กรอกข้อมูลที่จำเป็นสำหรับรายการสินค้า"
            icon={PackagePlus}
          />
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <TextField
              label="ชื่อสินค้า"
              value={form.name}
              onChange={(value) =>
                setForm((current) => ({ ...current, name: value }))
              }
              required
            />
            <TextField
              label="SKU"
              value={form.sku}
              onChange={(value) =>
                setForm((current) => ({ ...current, sku: value }))
              }
              required
            />
            <TextField
              label="ราคา"
              type="number"
              value={form.price}
              onChange={(value) =>
                setForm((current) => ({ ...current, price: value }))
              }
              required
            />
            <TextField
              label="ราคาเดิม"
              type="number"
              value={form.originalPrice}
              onChange={(value) =>
                setForm((current) => ({ ...current, originalPrice: value }))
              }
            />
            <TextField
              label="จำนวนสต็อก"
              type="number"
              value={form.stock}
              onChange={(value) =>
                setForm((current) => ({ ...current, stock: value }))
              }
              required
            />
            <TextField
              label="หมวดหมู่"
              value={form.category}
              onChange={(value) =>
                setForm((current) => ({ ...current, category: value }))
              }
              required
            />
            <TextField
              className="md:col-span-2"
              label="Image URL"
              value={form.image}
              onChange={(value) =>
                setForm((current) => ({ ...current, image: value }))
              }
            />
            <label className="md:col-span-2">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                รายละเอียด
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-teal-950"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
              >
                <PackagePlus className="h-4 w-4" />
                {isSaving ? "Saving..." : "Add product"}
              </button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

function TextField({
  className = "",
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-teal-950"
      />
    </label>
  );
}
