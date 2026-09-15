"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import {
  getSaasAssignees,
  getSaasProjects,
  getSaasTasks,
  updateSaasTaskProgress,
  updateSaasTaskStatus,
} from "@/lib/actions";
import {
  SaasAssignee,
  SaasProject,
  SaasTask,
  SaasTaskPriority,
  SaasTaskStatus,
} from "@/lib/data";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListChecks,
  Search,
  SlidersHorizontal,
  Target,
} from "lucide-react";

const statusLabel: Record<SaasTaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "Review",
  DONE: "Done",
};

const statusStyle: Record<SaasTaskStatus, string> = {
  BACKLOG:
    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  TODO: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900",
  IN_PROGRESS:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  IN_REVIEW:
    "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
};

const priorityStyle: Record<SaasTaskPriority, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-600 dark:text-blue-400",
  HIGH: "text-amber-600 dark:text-amber-400",
  URGENT: "text-rose-600 dark:text-rose-400",
};

const todayTime = new Date("2026-07-30T00:00:00+07:00").getTime();

export default function TaskListPage() {
  const t = useTranslations("pages.tasklist");
  const [tasks, setTasks] = useState<SaasTask[]>([]);
  const [projects, setProjects] = useState<SaasProject[]>([]);
  const [assignees, setAssignees] = useState<SaasAssignee[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [assigneeId, setAssigneeId] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "progress">(
    "dueDate",
  );

  const loadTasks = useCallback(async () => {
    const rows = await getSaasTasks({ search, status, projectId, assigneeId });
    setTasks(rows);
  }, [assigneeId, projectId, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTasks]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const [projectRows, assigneeRows] = await Promise.all([
        getSaasProjects(),
        getSaasAssignees(),
      ]);
      setProjects(projectRows);
      setAssignees(assigneeRows);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<SaasTaskPriority, number> = {
      URGENT: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };
    return [...tasks].sort((a, b) => {
      if (sortBy === "priority")
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === "progress") return a.progress - b.progress;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [sortBy, tasks]);

  const summary = useMemo(() => {
    const done = tasks.filter((task) => task.status === "DONE").length;
    const urgent = tasks.filter((task) => task.priority === "URGENT").length;
    const dueSoon = tasks.filter((task) => {
      const diffDays = Math.ceil(
        (new Date(task.dueDate).getTime() - todayTime) / 86400000,
      );
      return diffDays >= 0 && diffDays <= 3 && task.status !== "DONE";
    }).length;
    const avgProgress =
      tasks.length > 0
        ? Math.round(
            tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length,
          )
        : 0;
    return { done, urgent, dueSoon, avgProgress };
  }, [tasks]);

  async function handleStatus(taskId: string, nextStatus: SaasTaskStatus) {
    await updateSaasTaskStatus(taskId, nextStatus);
    loadTasks();
  }

  async function handleProgress(taskId: string, nextProgress: string) {
    const progress = Number(nextProgress);
    if (Number.isNaN(progress)) return;
    await updateSaasTaskProgress(taskId, progress);
    loadTasks();
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchChange={setSearch} placeholder={t("search")} />

      <div className="flex-1 overflow-y-auto p-6">
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              <ListChecks className="h-3.5 w-3.5" />
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
            <FilterSelect label="Status" value={status} onChange={setStatus}>
              <option value="all">ทั้งหมด</option>
              {(Object.keys(statusLabel) as SaasTaskStatus[]).map((item) => (
                <option key={item} value={item}>
                  {statusLabel[item]}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Project"
              value={projectId}
              onChange={setProjectId}
            >
              <option value="all">ทุกโปรเจกต์</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Owner"
              value={assigneeId}
              onChange={setAssigneeId}
            >
              <option value="all">ทุกคน</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Sort"
              value={sortBy}
              onChange={(value) => setSortBy(value as typeof sortBy)}
            >
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
            </FilterSelect>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={CheckCircle2}
            label="Completed"
            value={`${summary.done}`}
            detail="งานที่เสร็จแล้ว"
          />
          <Metric
            icon={AlertTriangle}
            label="Urgent"
            value={`${summary.urgent}`}
            detail="ต้องจัดลำดับก่อน"
          />
          <Metric
            icon={Clock3}
            label="Due soon"
            value={`${summary.dueSoon}`}
            detail="ครบกำหนดใน 3 วัน"
          />
          <Metric
            icon={Target}
            label="Avg progress"
            value={`${summary.avgProgress}%`}
            detail="จากรายการที่แสดง"
          />
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Task table
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                รายการงาน {sortedTasks.length} รายการ
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหา task..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-950"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-400 dark:bg-slate-800/60">
                <tr>
                  <th className="px-4 py-3 font-black">Task</th>
                  <th className="px-4 py-3 font-black">Project</th>
                  <th className="px-4 py-3 font-black">Owner</th>
                  <th className="px-4 py-3 font-black">Priority</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 text-center font-black">Progress</th>
                  <th className="px-4 py-3 text-right font-black">Estimate</th>
                  <th className="px-4 py-3 text-right font-black">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="bg-white align-middle transition hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-4">
                      <div className="max-w-[360px]">
                        <div className="font-black text-slate-900 dark:text-white">
                          {task.title}
                        </div>
                        <div className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-400">
                          {task.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300">
                      {task.projectName}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">
                      {task.assigneeName}
                    </td>
                    <td
                      className={`px-4 py-4 font-black ${priorityStyle[task.priority]}`}
                    >
                      {task.priority}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={task.status}
                        onChange={(event) =>
                          handleStatus(
                            task.id,
                            event.target.value as SaasTaskStatus,
                          )
                        }
                        className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 outline-none ${statusStyle[task.status]}`}
                      >
                        {(Object.keys(statusLabel) as SaasTaskStatus[]).map(
                          (item) => (
                            <option key={item} value={item}>
                              {statusLabel[item]}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.progress}
                          onChange={(event) =>
                            handleProgress(task.id, event.target.value)
                          }
                          className="w-28 accent-indigo-600"
                        />
                        <span className="w-10 text-right font-black text-slate-700 dark:text-slate-200">
                          {task.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-500">
                      {task.estimateHours}h
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-500">
                      {task.dueDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
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
