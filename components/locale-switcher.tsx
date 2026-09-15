"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";

import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
      <Languages className="h-3.5 w-3.5" />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) =>
          router.replace(pathname, { locale: event.target.value as Locale })
        }
        className="bg-transparent text-xs font-black outline-none"
        aria-label={t("language")}
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>
            {item === "th" ? t("thai") : t("english")}
          </option>
        ))}
      </select>
    </label>
  );
}
