"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sun,
  Moon,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  MessageSquare,
  Settings,
  CheckCircle2,
  UserRoundCog,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTheme } from "@/components/theme-provider";
import { Link } from "@/i18n/navigation";
import { getConversations, getSaasTasks, getUnreadCount } from "@/lib/actions";

const todayTime = new Date("2026-07-31T00:00:00+07:00").getTime();

interface HeaderProps {
  onSearchChange?: (term: string) => void;
  placeholder?: string;
}

export function Header({
  onSearchChange,
  placeholder,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("common");
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      detail: string;
      href: string;
      tone: "rose" | "amber" | "blue" | "emerald";
    }[]
  >([]);
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      const [unread, conversations, tasks] = await Promise.all([
        getUnreadCount(),
        getConversations(),
        getSaasTasks(),
      ]);
      const unreadConversations = conversations.filter(
        (conversation) => conversation.unreadCount > 0,
      );
      const urgentTasks = tasks.filter(
        (task) => task.priority === "URGENT" && task.status !== "DONE",
      );
      const dueSoonTasks = tasks.filter((task) => {
        const diffDays = Math.ceil(
          (new Date(task.dueDate).getTime() - todayTime) / 86400000,
        );
        return diffDays >= 0 && diffDays <= 3 && task.status !== "DONE";
      });

      setUnreadCount(unread);
      setNotifications([
        ...unreadConversations.slice(0, 3).map((conversation) => ({
          id: `chat-${conversation.id}`,
          title: t("newChatFrom", {
            name: conversation.customer?.name ?? t("customer"),
          }),
          detail: conversation.lastMessage ?? conversation.subject,
          href: "/chat",
          tone: "rose" as const,
        })),
        ...urgentTasks.slice(0, 2).map((task) => ({
          id: `urgent-${task.id}`,
          title: t("urgentTask", { id: task.id }),
          detail: task.title,
          href: "/tasklist",
          tone: "amber" as const,
        })),
        ...dueSoonTasks.slice(0, 2).map((task) => ({
          id: `due-${task.id}`,
          title: t("dueSoon", { date: task.dueDate }),
          detail: task.title,
          href: "/taskkanban",
          tone: "blue" as const,
        })),
      ]);
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [t]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearchChange) onSearchChange(val);
  };

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm shadow-slate-200/40 dark:shadow-black/20">
      {/* Search Input */}
      <div className="relative w-80 sm:w-96 hidden md:block">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder={placeholder ?? t("searchPlaceholder")}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Chat Link */}
        <Link
          href="/chat"
          className="relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span className="hidden sm:inline">{t("customerChat")}</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationOpen((value) => !value);
              setIsAccountOpen(false);
            }}
            className="relative p-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={t("notifications")}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/12 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/40">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {t("notificationTitle")}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    {t("itemsToReview", { count: notifications.length })}
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-800">
                  {t("live")}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                    <CheckCircle2 className="mb-2 h-6 w-6 text-emerald-500" />
                    <div className="text-xs font-black text-slate-700 dark:text-slate-200">
                      {t("noNotifications")}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {t("allClear")}
                    </div>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsNotificationOpen(false)}
                      className="flex gap-3 rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          item.tone === "rose"
                            ? "bg-rose-500"
                            : item.tone === "amber"
                              ? "bg-amber-500"
                              : item.tone === "blue"
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black text-slate-800 dark:text-slate-100">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-[11px] leading-4 text-slate-400">
                          {item.detail}
                        </span>
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Mode Switcher */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={t("switchTheme")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        )}

        <LocaleSwitcher />

        {/* User Account Menu */}
        <div className="relative border-l border-slate-200/80 pl-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setIsAccountOpen((value) => !value);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-2xl px-1.5 py-1 text-left transition hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-expanded={isAccountOpen}
            aria-haspopup="menu"
          >
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin avatar"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                John Doe
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                {t("admin")}
              </div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
          </button>

          {isAccountOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/12 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/40"
            >
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  John Doe
                </div>
                <div className="mt-0.5 text-[11px] font-semibold text-slate-400">
                  john.admin@ecomflow.local
                </div>
              </div>
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setIsAccountOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
              >
                <UserRoundCog className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                Edit profile
              </Link>
              <Link
                href="/profile#account-settings"
                role="menuitem"
                onClick={() => setIsAccountOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Account setting
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => setIsAccountOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
