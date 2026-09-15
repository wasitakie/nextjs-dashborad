"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { getConversations, getSaasTasks } from "@/lib/actions";
import { Conversation, SaasTask } from "@/lib/data";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  KeyRound,
  Mail,
  MapPin,
  MessageSquare,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";

const profile = {
  name: "John Doe",
  role: "Store Admin",
  email: "john.doe@ecomflow.local",
  location: "Bangkok, Thailand",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
  plan: "Operations Pro",
  timezone: "Asia/Bangkok",
  bio: "ดูแล workflow หลักของ EcomFlow ตั้งแต่คำสั่งซื้อ สต็อกสินค้า ไปจนถึงการตอบแชตลูกค้า",
};

const todayTime = new Date("2026-07-30T00:00:00+07:00").getTime();

export default function ProfilePage() {
  const t = useTranslations("pages.profile");
  const [tasks, setTasks] = useState<SaasTask[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [profileForm, setProfileForm] = useState(profile);
  const [savedProfile, setSavedProfile] = useState(profile);
  const isDirty = useMemo(
    () => JSON.stringify(profileForm) !== JSON.stringify(savedProfile),
    [profileForm, savedProfile],
  );

  const updateProfileField = (field: keyof typeof profile, value: string) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const loadData = useCallback(async () => {
    const [taskRows, conversationRows] = await Promise.all([
      getSaasTasks({ search }),
      getConversations({ search }),
    ]);
    setTasks(taskRows);
    setConversations(conversationRows);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const summary = useMemo(() => {
    const ownedTasks = tasks.filter(
      (task) => task.assigneeName === "Nara Chen" || task.priority === "URGENT",
    );
    const done = tasks.filter((task) => task.status === "DONE").length;
    const unread = conversations.reduce(
      (sum, conversation) => sum + conversation.unreadCount,
      0,
    );
    const dueSoon = tasks.filter((task) => {
      const diffDays = Math.ceil(
        (new Date(task.dueDate).getTime() - todayTime) / 86400000,
      );
      return diffDays >= 0 && diffDays <= 7 && task.status !== "DONE";
    }).length;
    return { ownedTasks, done, unread, dueSoon };
  }, [conversations, tasks]);

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <div className="flex-1 overflow-y-auto p-6">
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-28 bg-gradient-to-r from-slate-950 via-cyan-800 to-emerald-700" />
          <div className="flex flex-col gap-6 px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Image
                  src={profileForm.avatar}
                  alt={profileForm.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900"
                />
                <div className="pb-1">
                  <h1 className="text-2xl font-black tracking-tight text-white dark:text-white">
                    {profileForm.name}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {profileForm.role} - {profileForm.plan}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                      <Mail className="h-3.5 w-3.5" />
                      {profileForm.email}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                      <MapPin className="h-3.5 w-3.5" />
                      {profileForm.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:pb-1">
                <button
                  type="button"
                  onClick={() => setProfileForm(savedProfile)}
                  disabled={!isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setSavedProfile(profileForm)}
                  disabled={!isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <InlineField
                label="Display name"
                value={profileForm.name}
                onChange={(value) => updateProfileField("name", value)}
              />
              <InlineField
                label="Role"
                value={profileForm.role}
                onChange={(value) => updateProfileField("role", value)}
              />
              <InlineField
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(value) => updateProfileField("email", value)}
              />
              <InlineField
                label="Location"
                value={profileForm.location}
                onChange={(value) => updateProfileField("location", value)}
              />
              <InlineField
                label="Plan"
                value={profileForm.plan}
                onChange={(value) => updateProfileField("plan", value)}
              />
              <InlineField
                label="Timezone"
                value={profileForm.timezone}
                onChange={(value) => updateProfileField("timezone", value)}
              />
              <InlineField
                label="Avatar URL"
                value={profileForm.avatar}
                onChange={(value) => updateProfileField("avatar", value)}
                className="lg:col-span-2"
              />
              <InlineField
                label="Profile note"
                value={profileForm.bio}
                onChange={(value) => updateProfileField("bio", value)}
                multiline
                className="lg:col-span-2"
              />
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={CircleUserRound}
            label="Owned focus"
            value={`${summary.ownedTasks.length}`}
            detail="งานที่เกี่ยวข้องกับคุณ"
          />
          <Metric
            icon={CheckCircle2}
            label="Done tasks"
            value={`${summary.done}`}
            detail="งานปิดแล้วใน workspace"
          />
          <Metric
            icon={Bell}
            label="Unread alerts"
            value={`${summary.unread}`}
            detail="ข้อความลูกค้ายังไม่อ่าน"
          />
          <Metric
            icon={CalendarDays}
            label="Due this week"
            value={`${summary.dueSoon}`}
            detail="ครบกำหนดใน 7 วัน"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
            <h2 className="mb-4 text-sm font-black text-slate-900 dark:text-white">
              Recent focus tasks
            </h2>
            <div className="space-y-3">
              {summary.ownedTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-400">
                        {task.projectName} - {task.assigneeName}
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-800">
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-cyan-600"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Panel id="account-settings" title="Security">
              <SettingRow
                icon={ShieldCheck}
                title="Two-factor authentication"
                detail="Enabled for admin account"
              />
              <SettingRow
                icon={KeyRound}
                title="API access"
                detail="Scoped to dashboard operations"
              />
            </Panel>

            <Panel title="Notifications">
              <SettingRow
                icon={MessageSquare}
                title="Customer chat"
                detail="Popup and sidebar badge enabled"
              />
              <SettingRow
                icon={Bell}
                title="Task reminders"
                detail="Urgent and due-soon alerts enabled"
              />
            </Panel>
          </div>
        </section>
      </div>
    </div>
  );
}

function InlineField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  className?: string;
}) {
  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900";

  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-black uppercase text-slate-400">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
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
      <div className="text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-slate-400">
        {detail}
      </div>
    </div>
  );
}

function Panel({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="mb-4 text-sm font-black text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <Icon className="mt-0.5 h-4 w-4 text-cyan-600 dark:text-cyan-300" />
      <div>
        <div className="text-xs font-black text-slate-800 dark:text-slate-100">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] font-medium text-slate-400">
          {detail}
        </div>
      </div>
    </div>
  );
}
