"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChartPanel,
  MultiBarChart,
  StatusPie,
  VelocityChart,
} from "@/components/dashboard-charts";
import { Header } from "@/components/header";
import {
  createSaasTask,
  getSaasAssignees,
  getSaasProjects,
  getSaasTasks,
  getTaskVelocity,
  updateSaasTaskProgress,
  updateSaasTaskStatus,
} from "@/lib/actions";
import {
  SaasAssignee,
  SaasProject,
  SaasTask,
  SaasTaskPriority,
  SaasTaskStatus,
  TaskVelocityPoint,
} from "@/lib/data";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock3,
  FolderKanban,
  ListChecks,
  Plus,
  Search,
  Sparkles,
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

const priorityLabel: Record<SaasTaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const priorityStyle: Record<SaasTaskPriority, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-600 dark:text-blue-400",
  HIGH: "text-amber-600 dark:text-amber-400",
  URGENT: "text-rose-600 dark:text-rose-400",
};

const emptyForm = {
  title: "",
  description: "",
  projectId: "",
  assigneeId: "",
  priority: "MEDIUM" as SaasTaskPriority,
  status: "TODO" as SaasTaskStatus,
  dueDate: "",
  estimateHours: "8",
  tags: "",
};

export default function TasksPage() {
  const t = useTranslations("pages.tasks");
  const [tasks, setTasks] = useState<SaasTask[]>([]);
  const [projects, setProjects] = useState<SaasProject[]>([]);
  const [assignees, setAssignees] = useState<SaasAssignee[]>([]);
  const [velocity, setVelocity] = useState<TaskVelocityPoint[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [assigneeId, setAssigneeId] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

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
      const [projectRows, assigneeRows, velocityRows] = await Promise.all([
        getSaasProjects(),
        getSaasAssignees(),
        getTaskVelocity(),
      ]);
      setProjects(projectRows);
      setAssignees(assigneeRows);
      setVelocity(velocityRows);
      setForm((current) => ({
        ...current,
        projectId: current.projectId || projectRows[0]?.id || "",
        assigneeId: current.assigneeId || assigneeRows[0]?.id || "",
      }));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const analytics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.status === "DONE").length;
    const inFlight = tasks.filter(
      (task) => task.status === "IN_PROGRESS" || task.status === "IN_REVIEW",
    ).length;
    const urgent = tasks.filter((task) => task.priority === "URGENT").length;
    const totalHours = tasks.reduce((sum, task) => sum + task.estimateHours, 0);
    const avgProgress =
      total > 0
        ? Math.round(
            tasks.reduce((sum, task) => sum + task.progress, 0) / total,
          )
        : 0;

    const statusChart = (Object.keys(statusLabel) as SaasTaskStatus[])
      .map((item) => ({
        name: statusLabel[item],
        value: tasks.filter((task) => task.status === item).length,
      }))
      .filter((item) => item.value > 0);

    const priorityChart = (
      Object.keys(priorityLabel) as SaasTaskPriority[]
    ).map((item) => ({
      name: priorityLabel[item],
      hours: tasks
        .filter((task) => task.priority === item)
        .reduce((sum, task) => sum + task.estimateHours, 0),
    }));

    return {
      total,
      done,
      inFlight,
      urgent,
      totalHours,
      avgProgress,
      statusChart,
      priorityChart,
    };
  }, [tasks]);

  async function handleStatusChange(
    taskId: string,
    nextStatus: SaasTaskStatus,
  ) {
    await updateSaasTaskStatus(taskId, nextStatus);
    loadTasks();
  }

  async function handleProgressChange(taskId: string, nextProgress: string) {
    const progress = Number(nextProgress);
    if (Number.isNaN(progress)) return;
    await updateSaasTaskProgress(taskId, progress);
    loadTasks();
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    await createSaasTask({
      title: form.title.trim(),
      description: form.description.trim(),
      projectId: form.projectId,
      assigneeId: form.assigneeId,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate,
      estimateHours: Number(form.estimateHours),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setForm({
      ...emptyForm,
      projectId: projects[0]?.id || "",
      assigneeId: assignees[0]?.id || "",
    });
    setStatus("all");
    setProjectId("all");
    setAssigneeId("all");
    setSearch("");
    setIsSaving(false);
    loadTasks();
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        onSearchChange={setSearch}
        placeholder={t("search")}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
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
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric
            icon={ListChecks}
            label="Tasks"
            value={`${analytics.total}`}
            detail={`${analytics.done} completed`}
          />
          <Metric
            icon={Activity}
            label="In flight"
            value={`${analytics.inFlight}`}
            detail="กำลังทำหรือรอ review"
          />
          <Metric
            icon={Target}
            label="Avg progress"
            value={`${analytics.avgProgress}%`}
            detail="ค่าเฉลี่ยจากงานที่กรอง"
          />
          <Metric
            icon={Clock3}
            label="Estimated"
            value={`${analytics.totalHours}h`}
            detail="ชั่วโมงงานรวม"
          />
          <Metric
            icon={CircleDot}
            label="Urgent"
            value={`${analytics.urgent}`}
            detail="priority เร่งด่วน"
          />
        </section>

        <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <ChartPanel
            title="Task Velocity"
            subtitle="Created vs completed รายสัปดาห์"
            icon={BarChart3}
            className="xl:col-span-2"
          >
            <VelocityChart velocity={velocity} />
          </ChartPanel>

          <ChartPanel
            title="Status Mix"
            subtitle="งานแบ่งตามสถานะ"
            icon={FolderKanban}
          >
            <StatusPie data={analytics.statusChart} />
          </ChartPanel>

          <ChartPanel
            title="Priority Workload"
            subtitle="ชั่วโมงงานตาม priority"
            icon={Target}
            className="xl:col-span-3"
          >
            <MultiBarChart
              data={analytics.priorityChart}
              bars={[{ dataKey: "hours", fill: "#0f766e" }]}
              height={220}
            />
          </ChartPanel>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Task list
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  ปรับสถานะและ progress ได้จากตารางนี้
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหางาน..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-950"
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
                    <th className="px-4 py-3 text-center font-black">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-right font-black">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="bg-white align-middle transition hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-4">
                        <div className="max-w-[340px]">
                          <div className="font-black text-slate-900 dark:text-white">
                            {task.title}
                          </div>
                          <div className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-400">
                            {task.description}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300">
                        {task.projectName}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-100 text-[10px] text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                            {task.assigneeName.slice(0, 2).toUpperCase()}
                          </span>
                          {task.assigneeName}
                        </div>
                      </td>
                      <td
                        className={`px-4 py-4 font-black ${priorityStyle[task.priority]}`}
                      >
                        {priorityLabel[task.priority]}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={task.status}
                          onChange={(event) =>
                            handleStatusChange(
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
                              handleProgressChange(task.id, event.target.value)
                            }
                            className="w-24 accent-cyan-600"
                          />
                          <span className="w-10 text-right font-black text-slate-700 dark:text-slate-200">
                            {task.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-500">
                        {task.dueDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={handleCreateTask}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Create task
                </h2>
                <p className="text-xs text-slate-400">
                  เพิ่มงานใหม่ใน SaaS workspace
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <TextField
                label="Task title"
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
                required
              />
              <TextareaField
                label="Description"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
              />

              <SelectField
                label="Project"
                value={form.projectId}
                onChange={(value) => setForm({ ...form, projectId: value })}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Assignee"
                value={form.assigneeId}
                onChange={(value) => setForm({ ...form, assigneeId: value })}
              >
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </option>
                ))}
              </SelectField>

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Priority"
                  value={form.priority}
                  onChange={(value) =>
                    setForm({ ...form, priority: value as SaasTaskPriority })
                  }
                >
                  {(Object.keys(priorityLabel) as SaasTaskPriority[]).map(
                    (item) => (
                      <option key={item} value={item}>
                        {priorityLabel[item]}
                      </option>
                    ),
                  )}
                </SelectField>

                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    setForm({ ...form, status: value as SaasTaskStatus })
                  }
                >
                  {(Object.keys(statusLabel) as SaasTaskStatus[]).map(
                    (item) => (
                      <option key={item} value={item}>
                        {statusLabel[item]}
                      </option>
                    ),
                  )}
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Due date"
                  type="date"
                  value={form.dueDate}
                  onChange={(value) => setForm({ ...form, dueDate: value })}
                  required
                />
                <TextField
                  label="Estimate hours"
                  type="number"
                  min="1"
                  value={form.estimateHours}
                  onChange={(value) =>
                    setForm({ ...form, estimateHours: value })
                  }
                  required
                />
              </div>

              <TextField
                label="Tags"
                value={form.tags}
                onChange={(value) => setForm({ ...form, tags: value })}
                placeholder="API, Design, Launch"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSaving ? "Saving..." : "Create task"}
            </button>
          </form>
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

function SelectField({
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
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-black text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-950"
      >
        {children}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-black text-slate-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required={required}
        min={min}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-950"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-black text-slate-500">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-950"
      />
    </label>
  );
}
