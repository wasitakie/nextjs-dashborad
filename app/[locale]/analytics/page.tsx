"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChartPanel,
  MultiBarChart,
  StatusPie,
  ValuePieChart,
  VelocityChart,
} from "@/components/dashboard-charts";
import { Header } from "@/components/header";
import {
  getOrders,
  getProducts,
  getSaasProjects,
  getSaasTasks,
  getTaskVelocity,
} from "@/lib/actions";
import {
  Order,
  Product,
  SaasProject,
  SaasTask,
  SaasTaskStatus,
  TaskVelocityPoint,
} from "@/lib/data";
import {
  Activity,
  BarChart3,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  FolderKanban,
  Target,
} from "lucide-react";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const statusLabel: Record<SaasTaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "Review",
  DONE: "Done",
};

export default function AnalyticsPage() {
  const t = useTranslations("pages.analytics");
  const [tasks, setTasks] = useState<SaasTask[]>([]);
  const [projects, setProjects] = useState<SaasProject[]>([]);
  const [velocity, setVelocity] = useState<TaskVelocityPoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    const [taskRows, projectRows, velocityRows, orderRows, productRows] =
      await Promise.all([
        getSaasTasks({ search }),
        getSaasProjects(),
        getTaskVelocity(),
        getOrders({ search }),
        getProducts({ search }),
      ]);
    setTasks(taskRows);
    setProjects(projectRows);
    setVelocity(velocityRows);
    setOrders(orderRows);
    setProducts(productRows);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const analytics = useMemo(() => {
    const completedTasks = tasks.filter(
      (task) => task.status === "DONE",
    ).length;
    const activeTasks = tasks.filter(
      (task) => task.status === "IN_PROGRESS" || task.status === "IN_REVIEW",
    ).length;
    const stockValue = products.reduce(
      (sum, product) => sum + product.stock * product.price,
      0,
    );
    const revenue = orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const avgProjectHealth =
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, project) => sum + project.health, 0) /
              projects.length,
          )
        : 0;

    const statusMix = (Object.keys(statusLabel) as SaasTaskStatus[])
      .map((status) => ({
        name: statusLabel[status],
        value: tasks.filter((task) => task.status === status).length,
      }))
      .filter((item) => item.value > 0);

    const projectProgress = projects.map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.projectId === project.id,
      );
      const avgProgress =
        projectTasks.length > 0
          ? Math.round(
              projectTasks.reduce((sum, task) => sum + task.progress, 0) /
                projectTasks.length,
            )
          : 0;
      return {
        name: project.name.replace(" ", "\n"),
        progress: avgProgress,
        health: project.health,
      };
    });

    const inventoryByCategory = products.reduce<Record<string, number>>(
      (acc, product) => {
        acc[product.category] =
          (acc[product.category] ?? 0) + product.stock * product.price;
        return acc;
      },
      {},
    );

    return {
      activeTasks,
      completedTasks,
      stockValue,
      revenue,
      avgProjectHealth,
      statusMix,
      projectProgress,
      inventoryChart: Object.entries(inventoryByCategory).map(
        ([name, value]) => ({ name, value }),
      ),
    };
  }, [orders, products, projects, tasks]);

  return (
    <div className="flex h-screen flex-col">
      <Header
        onSearchChange={setSearch}
        placeholder={t("search")}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <section className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            <BarChart3 className="h-3.5 w-3.5" />
            {t("badge")}
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric
            icon={Activity}
            label="Active tasks"
            value={`${analytics.activeTasks}`}
            detail="กำลังทำและรอ review"
          />
          <Metric
            icon={CheckCircle2}
            label="Completed"
            value={`${analytics.completedTasks}`}
            detail="งานที่ปิดแล้ว"
          />
          <Metric
            icon={Target}
            label="Project health"
            value={`${analytics.avgProjectHealth}%`}
            detail="ค่าเฉลี่ยทุกโปรเจกต์"
          />
          <Metric
            icon={CircleDollarSign}
            label="Paid revenue"
            value={money.format(analytics.revenue)}
            detail="จากคำสั่งซื้อที่ชำระแล้ว"
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
            title="Task Velocity"
            subtitle="Created vs completed รายสัปดาห์"
            className="xl:col-span-2"
          >
            <VelocityChart velocity={velocity} />
          </ChartPanel>

          <ChartPanel title="Task Status Mix" subtitle="สัดส่วนงานตามสถานะ">
            <StatusPie data={analytics.statusMix} />
          </ChartPanel>

          <ChartPanel
            title="Project Progress vs Health"
            subtitle="เปรียบเทียบ progress และ health"
            className="xl:col-span-2"
          >
            <MultiBarChart
              data={analytics.projectProgress}
              bars={[
                { dataKey: "progress", fill: "#0891b2" },
                { dataKey: "health", fill: "#8b5cf6" },
              ]}
            />
          </ChartPanel>

          <ChartPanel title="Inventory Value" subtitle="มูลค่าสต็อกตามหมวดหมู่">
            <ValuePieChart
              data={analytics.inventoryChart}
              formatter={(value) => money.format(value)}
            />
          </ChartPanel>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-sky-600" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Project health snapshot
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {project.name}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-800">
                      {project.plan}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-sky-600"
                      style={{ width: `${project.health}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-500">
                    Health {project.health}% - due {project.dueDate}
                  </div>
                </div>
              ))}
            </div>
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
      <div className="truncate text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-slate-400">
        {detail}
      </div>
    </div>
  );
}
