"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import {
  getSaasProjects,
  getSaasTasks,
  updateSaasTaskStatus,
} from "@/lib/actions";
import {
  SaasProject,
  SaasTask,
  SaasTaskPriority,
  SaasTaskStatus,
} from "@/lib/data";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Columns3,
  MoveRight,
  Search,
  Target,
} from "lucide-react";

const columns: { status: SaasTaskStatus; label: string; accent: string }[] = [
  {
    status: "BACKLOG",
    label: "Backlog",
    accent: "border-slate-300 dark:border-slate-700",
  },
  {
    status: "TODO",
    label: "To do",
    accent: "border-blue-300 dark:border-blue-800",
  },
  {
    status: "IN_PROGRESS",
    label: "In progress",
    accent: "border-amber-300 dark:border-amber-800",
  },
  {
    status: "IN_REVIEW",
    label: "Review",
    accent: "border-violet-300 dark:border-violet-800",
  },
  {
    status: "DONE",
    label: "Done",
    accent: "border-emerald-300 dark:border-emerald-800",
  },
];

const priorityStyle: Record<SaasTaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  HIGH: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  URGENT: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

export default function TaskKanbanPage() {
  const t = useTranslations("pages.taskkanban");
  const [tasks, setTasks] = useState<SaasTask[]>([]);
  const [projects, setProjects] = useState<SaasProject[]>([]);
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("all");

  const loadTasks = useCallback(async () => {
    const rows = await getSaasTasks({ search, projectId });
    setTasks(rows);
  }, [projectId, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTasks]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setProjects(await getSaasProjects());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    const done = tasks.filter((task) => task.status === "DONE").length;
    const urgent = tasks.filter(
      (task) => task.priority === "URGENT" && task.status !== "DONE",
    ).length;
    const avgProgress =
      tasks.length > 0
        ? Math.round(
            tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length,
          )
        : 0;
    return { done, urgent, avgProgress };
  }, [tasks]);

  async function moveTask(taskId: string, nextStatus: SaasTaskStatus) {
    await updateSaasTaskStatus(taskId, nextStatus);
    loadTasks();
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <div className="premium-page">
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              <Columns3 className="h-3.5 w-3.5" />
              {t("title")}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
              <span className="text-[11px] font-black text-slate-400">
                Project
              </span>
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none dark:text-slate-100"
              >
                <option value="all">ทุกโปรเจกต์</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Metric
            icon={Columns3}
            label="Tasks on board"
            value={`${tasks.length}`}
            detail="รายการในบอร์ด"
          />
          <Metric
            icon={CheckCircle2}
            label="Done"
            value={`${summary.done}`}
            detail="งานที่ปิดแล้ว"
          />
          <Metric
            icon={Target}
            label="Avg progress"
            value={`${summary.avgProgress}%`}
            detail={`${summary.urgent} urgent active`}
          />
        </section>

        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:w-96">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาการ์ด..."
            className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none dark:text-slate-100"
          />
        </div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status,
            );
            return (
              <div
                key={column.status}
                className={`min-h-[560px] rounded-2xl border-t-4 ${column.accent} bg-slate-100/70 p-3 dark:bg-slate-900/70`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    {column.label}
                  </h2>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-800">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-black ${priorityStyle[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        {task.priority === "URGENT" && (
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                        )}
                      </div>

                      <h3 className="text-sm font-black leading-5 text-slate-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-400">
                        {task.description}
                      </p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>{task.projectName}</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-teal-600"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>{task.assigneeName}</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {task.dueDate}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {columns
                          .filter((item) => item.status !== task.status)
                          .slice(0, 4)
                          .map((item) => (
                            <button
                              key={item.status}
                              type="button"
                              onClick={() => moveTask(task.id, item.status)}
                              className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              <MoveRight className="h-3 w-3" />
                              {item.label}
                            </button>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
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
      <div className="text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-slate-400">
        {detail}
      </div>
    </div>
  );
}
